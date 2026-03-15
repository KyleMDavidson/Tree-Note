import { LayoutNode, MarkedNode } from './types';

const MIN_RADIUS = 120;
const MIN_ANCESTOR_DIST = 180;
const MIN_UNCLE_RADIUS = 100;
const NODE_W = 80;

function findPath(root: MarkedNode, targetId: number): MarkedNode[] | null {
  if (root.id === targetId) return [root];
  for (const child of root.children) {
    const path = findPath(child, targetId);
    if (path) return [root, ...path];
  }
  return null;
}

export function computeLayout(root: MarkedNode, focusedId: number): LayoutNode[] {
  const path = findPath(root, focusedId);
  if (!path) return [];

  const focused = path[path.length - 1];
  const nodes: LayoutNode[] = [];

  // Focused node at canvas origin
  nodes.push({
    id: focused.id,
    x: 0,
    y: 0,
    scale: 1.0,
    opacity: 1.0,
    node: focused,
    kind: 'focused',
  });

  // Children in a full 360° circle
  const N = focused.children.length;
  let R_children = MIN_RADIUS;
  if (N > 0) {
    R_children = N === 1
      ? MIN_RADIUS
      : Math.max(MIN_RADIUS, NODE_W / (2 * Math.sin(Math.PI / N)));
    focused.children.forEach((child, i) => {
      const angle = (2 * Math.PI * i) / N;
      nodes.push({
        id: child.id,
        x: R_children * Math.cos(angle),
        y: R_children * Math.sin(angle),
        scale: 0.9,
        opacity: 0.95,
        node: child,
        kind: 'child',
      });
    });
  }

  // Ancestors and uncles — walk up the path
  // ancestorPos tracks where the previous ancestor was placed
  let childPos = { x: 0, y: 0 };
  let childRadius = R_children;

  for (let depth = path.length - 2; depth >= 0; depth--) {
    const ancestor = path[depth];
    // depth=path.length-2 → parent (ancestorLevel=1), depth=0 → root (ancestorLevel=path.length-1)
    const ancestorLevel = path.length - 1 - depth;
    const scale = Math.max(0.4, 1.0 - ancestorLevel * 0.15);
    const opacity = Math.max(0.3, 1.0 - ancestorLevel * 0.2);

    const parentDist = Math.max(MIN_ANCESTOR_DIST, childRadius * 1.5);
    const ancestorX = childPos.x;
    const ancestorY = childPos.y - parentDist;

    nodes.push({
      id: ancestor.id,
      x: ancestorX,
      y: ancestorY,
      scale,
      opacity,
      node: ancestor,
      kind: 'ancestor',
    });

    // Uncles: siblings of path[depth+1], spread in 270° arc avoiding the downward sector
    const focusedChild = path[depth + 1];
    const uncles = ancestor.children.filter(c => c.id !== focusedChild.id);
    const N_uncles = uncles.length;

    if (N_uncles > 0) {
      // Arc from 135° to 135°+270°=405° (clockwise through left, up, right)
      // This avoids the downward sector [45°, 135°] — i.e. the direction toward focused child
      const arc_start = (3 * Math.PI) / 4;
      const spread = (3 * Math.PI) / 2;
      const uncleRadius = MIN_UNCLE_RADIUS;

      uncles.forEach((uncle, i) => {
        const angle = arc_start + (spread / (N_uncles + 1)) * (i + 1);
        nodes.push({
          id: uncle.id,
          x: ancestorX + uncleRadius * Math.cos(angle),
          y: ancestorY + uncleRadius * Math.sin(angle),
          scale: 0.75,
          opacity: 0.75,
          node: uncle,
          kind: 'uncle',
        });
      });
    }

    childPos = { x: ancestorX, y: ancestorY };
    childRadius = MIN_UNCLE_RADIUS;
  }

  return nodes;
}
