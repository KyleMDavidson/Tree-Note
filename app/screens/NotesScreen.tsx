import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import { ContentfulTestRoot } from "../../src/models/fixtures";
import { MarkedNode, NodeTouchableBounds } from "../../src/models/types";

const NotesScreen = () => {
  const [rootNode, setRootNode] = useState<MarkedNode>(

    ContentfulTestRoot as MarkedNode
  );
  const [focusedNode, setFocusedNode] = useState<Partial<MarkedNode> | null>(
    ContentfulTestRoot as MarkedNode
  );
  const componentBounds = useRef<{
    [id: string]: NodeTouchableBounds & { ref: RefObject<any> };
  }>({});
  const componentRefs = useRef<{ [id: string]: RefObject<any> }>({});


  const handleSetFocusedNode = useCallback((node: MarkedNode) => {
    let nextRootNode = null;
    if (rootNode) {
      clearPathMarkings(rootNode);
      nextRootNode = { ...rootNode };
    }

    if (nextRootNode) markPathToFocused(nextRootNode, node);
    setFocusedNode(node);
    setRootNode(nextRootNode);
  }, []);

  const handleLayouts = useCallback(() => {
    Object.entries(componentRefs.current).map(([k, v]) =>
      v.current.measureInWindow(
        (x, y, width, height) =>
          (componentBounds.current[k] = {
            x: x,
            y: y,
            width: width,
            height: height,
          })
      )
    );
  }, []);

  //this is only triggering on collapse
  useEffect(()=>{
    console.log("handling layouts.")
    handleLayouts()
  },[focusedNode])


  const handleRemoval = useCallback((id: number) => {
    delete componentBounds.current[`${id}`];
  }, []);

  const ResponderConfig = {
    onResponderMove: (e) => {
      const node = findTouchedNode(
        componentBounds,
        e.nativeEvent.locationX,
        e.nativeEvent.locationY
      );
      node ? (node != focusedNode ? handleSetFocusedNode(node) : null) : null;
    },
    onMoveShouldSetResponder: (e) => true,
    //    onResponderRelease: (e) => console.log("release responder."),
    //  onResponderTerminationRequest: (e)=>true,
    //    onResponderGrant: (e)=>console.log(`responder granted in node ${e.target}`),
  };

  return (
    //superior for performance to pan responder (which is more liable to suffer locks on the thread)
    <View style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GestureDetector gesture={Gesture.Pan()}>
          <View style={{ borderWidth: 1, borderColor: "black" }}>
            {rootNode && (
              <View {...ResponderConfig}>
                <NoteTree
                  componentRefs={componentRefs}
                  node={rootNode}
                  focusedNode={focusedNode}
                  handleRemoval={handleRemoval}
                />
              </View>
            )}
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
      <Button
        title={"collapse"}
        onPress={() => {
          if (rootNode) {
            clearPathMarkings(rootNode);
            setRootNode(rootNode);
            setFocusedNode(null);
          }
        }}
      />
    </View>
  );
};

function markPathToFocused(n: MarkedNode, target: MarkedNode): boolean {
  if (n.id === target.id) {
    n.isOnPathToFocused = true;

    return true;
  }
  for (const child of n.children) {
    if (markPathToFocused(child, target)) {
      n.isOnPathToFocused = true;

      return true;
    }
  }

  return false;
}

function clearPathMarkings(n: MarkedNode) {
  n.isOnPathToFocused = false;

  n.children.forEach(clearPathMarkings);
}

function findTouchedNode(componentBounds: RefObject<NodeTouchableBounds>, x, y) {
  for (const [id, node] of Object.entries(componentBounds.current)) {
    if (
      x > node.x &&
      x < node.x + node.width &&
      y > node.y &&
      y < node.y + node.height
    ) {
      return { id: parseInt(id), ...node };
    }
  }
  return null;
}

function NoteTree({
  node,
  focusedNode,
  handleRemoval,
  componentRefs,
}: {
  node: MarkedNode;
  focusedNode: Partial<MarkedNode> | null;
  handleRemoval: (id: number) => void;
  componentRefs: RefObject<{ [id: string]: RefObject<any> }>;
}) {
  const shouldRenderChildren =
    node.isOnPathToFocused && node.children.length > 0;
  const touchTargetBoundsRef = useRef(null);

  //necessary due to spatial dependency between notes. Looking to eliminate this though - possible if we do something like guarantee the tree that has already been rendered.

  useEffect(() => {componentRefs.current[node.id] = touchTargetBoundsRef; return ()=>{delete componentRefs.current[node.id]; handleRemoval(node.id)}}, [focusedNode]);


  return (
    <View>
      <View style={styles.nodeContainer}>
        <Text
          style={
            focusedNode
              ? focusedNode.id == node.id
                ? [styles.nodeTitle, styles.focusedNodeTitle]
                : [styles.nodeTitle]
              : [styles.nodeTitle]
          }
          ref={touchTargetBoundsRef}
        >
          {node.title}
        </Text>
        {focusedNode?.id == node.id ? (
          node?.content ? (
            <Text style={{ borderColor: "black", borderWidth: 2 }}>
              {node.content}
            </Text>
          ) : null
        ) : null}
      </View>
      {shouldRenderChildren && (
        <View style={styles.childrenContainer}>
          {node.children.map((child) => (
            <NoteTree
              componentRefs={componentRefs}
              handleRemoval={handleRemoval}
              key={child.id}
              node={child}
              focusedNode={focusedNode}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// Helper function to find the parent of a node
function findParent(root: MarkedNode, target: MarkedNode): MarkedNode | null {
  if (!root.children) return null;
  if (root.children.some((child) => child.id === target.id)) return root;

  for (const child of root.children) {
    const parent = findParent(child, target);
    if (parent) return parent;
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  nodeContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  nodeTitle: {
    fontSize: 20,
    color: "dark grey",
    alignSelf: "flex-start",
    margin: 5,
    borderColor: "blue",
    borderWidth: 3,
    width: 70,
  },
  focusedNodeTitle: {
    borderColor: "red",
    borderWidth: 3,
  },
  childrenContainer: {
    marginLeft: 60,
  },
  aboveArea: {
    height: 20,
    backgroundColor: "transparent",
  },
});

export default NotesScreen;
