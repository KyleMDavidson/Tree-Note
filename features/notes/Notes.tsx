import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";

import { computeLayout } from "./layout";
import { ContentfulTestRoot } from "./fixtures";
import { LayoutNode, MarkedNode } from "./types";

const NODE_W = 80;
const NODE_H = 44;
const HIT_RADIUS = 60;

const Notes = () => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [focusedId, setFocusedId] = useState<number>(ContentfulTestRoot.id);
  const rootNode = useMemo(() => ContentfulTestRoot as MarkedNode, []);

  const layoutNodes = useMemo(
    () => computeLayout(rootNode, focusedId),
    [rootNode, focusedId]
  );

  const cx = containerSize.width / 2;
  const cy = containerSize.height / 2;

  const handleTouch = useCallback(
    (x: number, y: number) => {
      // Convert container-relative touch → layout coordinates
      const layoutX = x - cx;
      const layoutY = y - cy;
      const hit = layoutNodes.find(
        (n) => Math.hypot(n.x - layoutX, n.y - layoutY) < HIT_RADIUS
      );
      if (hit && hit.id !== focusedId) {
        setFocusedId(hit.id);
      }
    },
    [layoutNodes, focusedId, cx, cy]
  );

  const gesture = Gesture.Pan()
    .minDistance(0)
    .runOnJS(true)
    .onStart((e) => handleTouch(e.x, e.y))
    .onUpdate((e) => handleTouch(e.x, e.y));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <View
          style={{ flex: 1, overflow: "hidden" }}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setContainerSize({ width, height });
          }}
        >
          {layoutNodes.map((n) => (
            <NodeView key={n.id} layoutNode={n} cx={cx} cy={cy} isFocused={n.id === focusedId} />
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
  isFocused,
}: {
  layoutNode: LayoutNode;
  cx: number;
  cy: number;
  isFocused: boolean;
}) {
  const { x, y, scale, opacity, node, kind } = layoutNode;

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
