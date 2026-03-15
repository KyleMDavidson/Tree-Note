import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { runOnJS, useAnimatedReaction, useDerivedValue, useSharedValue } from "react-native-reanimated";

import { ContentfulTestRoot } from "./fixtures";
import { computeLayout } from "./layout";
import { LayoutNode, MarkedNode } from "./types";

const NODE_W = 80;
const NODE_H = 44;
const HIT_RADIUS = 60;

const Notes = () => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [layoutNodes, setLayoutNodes] = useState<LayoutNode[]>(
    () => computeLayout(ContentfulTestRoot as MarkedNode, ContentfulTestRoot.id)
  );
  const rootNode = useMemo(() => ContentfulTestRoot as MarkedNode, []);

  const focusedId = useSharedValue<number>(ContentfulTestRoot.id);
  const cx = useSharedValue(0);
  const cy = useSharedValue(0);

  // UI-thread layout — single source of truth for both hit detection and rendering
  const uiLayoutNodes = useDerivedValue(() => computeLayout(rootNode, focusedId.value));

  // Sync to JS only when focus changes, passing the already-computed nodes
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
      const hit = uiLayoutNodes.value.find(
        (n) => Math.hypot(n.x - layoutX, n.y - layoutY) < HIT_RADIUS
      );
      if (hit && hit.id !== focusedId.value) {
        focusedId.value = hit.id;
      }
    })
    .onUpdate((e) => {
      'worklet';
      const layoutX = e.x - cx.value;
      const layoutY = e.y - cy.value;
      const hit = uiLayoutNodes.value.find(
        (n) => Math.hypot(n.x - layoutX, n.y - layoutY) < HIT_RADIUS
      );
      if (hit && hit.id !== focusedId.value) {
        focusedId.value = hit.id;
      }
    });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <View
          style={{ flex: 1, overflow: "hidden" }}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setContainerSize({ width, height });
            cx.value = width / 2;
            cy.value = height / 2;
          }}
        >
          {layoutNodes.map((n) => (
            <NodeView
              key={n.id}
              layoutNode={n}
              cx={containerSize.width / 2}
              cy={containerSize.height / 2}
            />
          ))}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

function NodeView({
  layoutNode,
  cx,
  cy,
}: {
  layoutNode: LayoutNode;
  cx: number;
  cy: number;
}) {
  const { x, y, scale, opacity, node, kind } = layoutNode;
  const isFocused = kind === 'focused';

  const borderColor =
    isFocused ? "red" : kind === "child" || kind === "ancestor" ? "blue" : "grey";

  return (
    <View
      style={[
        styles.node,
        {
          left: cx + x - NODE_W / 2,
          top: cy + y - NODE_H / 2,
          borderColor,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Text style={styles.nodeText} numberOfLines={2}>
        {node.title}
      </Text>
      {isFocused && node.content ? (
        <Text style={styles.contentText} numberOfLines={3}>
          {node.content}
        </Text>
      ) : null}
    </View>
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
    color: "#222",
  },
  contentText: {
    fontSize: 9,
    color: "#555",
    textAlign: "center",
    marginTop: 2,
  },
});

export default Notes;
