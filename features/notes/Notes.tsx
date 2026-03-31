import { useMemo, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  DerivedValue,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  SharedValue,
} from "react-native-reanimated";

import { ContentfulTestRoot } from "./fixtures";
import { computeLayout } from "./layout";
import { LayoutNode, MarkedNode } from "./types";

const NODE_W = 80;
const NODE_H = 44;
const HIT_RADIUS = 60;
const TRANSITION_MS = 100;

function closestNode(nodes: LayoutNode[], layoutX: number, layoutY: number): LayoutNode | null {
  'worklet';
  let hit: LayoutNode | null = null;
  let minDist = HIT_RADIUS;
  for (let i = 0; i < nodes.length; i++) {
    const dist = Math.hypot(nodes[i].x - layoutX, nodes[i].y - layoutY);
    if (dist < minDist) {
      minDist = dist;
      hit = nodes[i];
    }
  }
  return hit;
}

const Notes = () => {
  const [layoutNodes, setLayoutNodes] = useState<LayoutNode[]>(
    () => computeLayout(ContentfulTestRoot as MarkedNode, ContentfulTestRoot.id)
  );
  const rootNode = useMemo(() => ContentfulTestRoot as MarkedNode, []);

  const focusedId = useSharedValue<number>(ContentfulTestRoot.id);
  const cx = useSharedValue(0);
  const cy = useSharedValue(0);
  const progress = useSharedValue(1);
  const prevLayout = useSharedValue<LayoutNode[]>(
    computeLayout(ContentfulTestRoot as MarkedNode, ContentfulTestRoot.id)
  );

  // UI-thread layout — single source of truth
  const uiLayoutNodes = useDerivedValue(() => computeLayout(rootNode, focusedId.value));

  // Sync to JS on focus change for React to know which nodes to render
  useAnimatedReaction(
    () => ({ id: focusedId.value, nodes: uiLayoutNodes.value }),
    (cur, prev) => {
      if (cur.id !== prev?.id) {
        runOnJS(setLayoutNodes)(cur.nodes);
      }
    }
  );

  const gesture = Gesture.Pan()
    .minDistance(0)
    .onStart((e) => {
      'worklet';
      const layoutX = e.x - cx.value;
      const layoutY = e.y - cy.value;
      const hit = closestNode(uiLayoutNodes.value, layoutX, layoutY);
      if (hit && hit.id !== focusedId.value) {
        prevLayout.value = uiLayoutNodes.value;
        focusedId.value = hit.id;
        progress.value = 0;
        progress.value = withTiming(1, { duration: TRANSITION_MS });
      }
    })
    .onUpdate((e) => {
      'worklet';
      const layoutX = e.x - cx.value;
      const layoutY = e.y - cy.value;
      const hit = closestNode(uiLayoutNodes.value, layoutX, layoutY);
      if (hit && hit.id !== focusedId.value) {
        prevLayout.value = uiLayoutNodes.value;
        focusedId.value = hit.id;
        progress.value = 0;
        progress.value = withTiming(1, { duration: TRANSITION_MS });
      }
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{ flex: 1, overflow: "hidden" }}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          cx.value = width / 2;
          cy.value = height / 2;
        }}
      >
        {layoutNodes.map((n) => (
          <NodeView
            key={n.id}
            layoutNode={n}
            currentLayout={uiLayoutNodes}
            prevLayout={prevLayout}
            progress={progress}
            cx={cx}
            cy={cy}
          />
        ))}
      </Animated.View>
    </GestureDetector>
  );
};

function NodeView({
  layoutNode,
  currentLayout,
  prevLayout,
  progress,
  cx,
  cy,
}: {
  layoutNode: LayoutNode;
  currentLayout: DerivedValue<LayoutNode[]>;
  prevLayout: SharedValue<LayoutNode[]>;
  progress: SharedValue<number>;
  cx: SharedValue<number>;
  cy: SharedValue<number>;
}) {
  const { node, kind } = layoutNode;
  const isFocused = kind === 'focused';

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const cur = currentLayout.value.find((n) => n.id === layoutNode.id);
    const prev = prevLayout.value.find((n) => n.id === layoutNode.id);

    if (!cur) return { opacity: 0 };

    const fromX = prev ? prev.x : cur.x;
    const fromY = prev ? prev.y : cur.y;
    const fromScale = prev ? prev.scale : cur.scale;
    const fromOpacity = prev ? prev.opacity : cur.opacity;

    const x = fromX + (cur.x - fromX) * p;
    const y = fromY + (cur.y - fromY) * p;
    const scale = fromScale + (cur.scale - fromScale) * p;
    const opacity = fromOpacity + (cur.opacity - fromOpacity) * p;

    const borderColor =
      cur.kind === 'focused' ? 'red'
      : cur.kind === 'child' || cur.kind === 'ancestor' ? 'blue'
      : 'grey';

    return {
      left: cx.value + x - NODE_W / 2,
      top: cy.value + y - NODE_H / 2,
      borderColor,
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={[styles.node, animatedStyle]}>
      <Text style={styles.nodeText} numberOfLines={2}>
        {node.title}
      </Text>
      {isFocused && node.content ? (
        <Text style={styles.contentText} numberOfLines={3}>
          {node.content}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  node: {
    position: "absolute",
    width: NODE_W,
    height: NODE_H,
    borderWidth: 2,
    borderRadius: 6,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  nodeText: {
    fontSize: 11,
    textAlign: "center",
    color: "#222222ff",
  },
  contentText: {
    fontSize: 9,
    color: "#555",
    textAlign: "center",
    marginTop: 2,
  },
});

export default Notes;
