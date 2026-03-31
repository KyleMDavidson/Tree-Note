type Node = {
    title: string;
    content: string;
    id: number;
    children: Node[]
}

type MarkedNode = Node & {
  isOnPathToFocused?: boolean;
};

type LayoutNode = {
  id: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  node: MarkedNode;
  kind: 'focused' | 'child' | 'ancestor' | 'uncle';
};

export type { LayoutNode, MarkedNode, Node };
