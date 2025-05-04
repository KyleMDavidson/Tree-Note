import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TestRoot } from '../fixtures';
import { Node } from '../types';

export default function ExplorerScreen() {
  const [rootNote, setRootNode] = useState<Node | null>(TestRoot);
  const [focusedNode, setFocusedNode] = useState<Node | null>(TestRoot);

  return (
    <ScrollView style={styles.container}>
      {rootNote && (
        <NoteTree 
          node={rootNote} 
          focusedNode={focusedNode}
          setFocusedNode={setFocusedNode}
          isRoot={true}
          isOnPathToFocused={true}
        />
      )}
    </ScrollView>
  );
}

function NoteTree({ 
  node, 
  focusedNode, 
  setFocusedNode,
  isRoot = false,
  isOnPathToFocused = false
}: { 
  node: Node;
  focusedNode: Node | null;
  setFocusedNode: (node: Node | null) => void;
  isRoot?: boolean;
  isOnPathToFocused?: boolean;
}) {
  const isFocused = focusedNode?.id === node.id;
  const shouldRenderChildren = (isOnPathToFocused || isFocused) && node.children.length > 0;

  const handlePress = () => {
    setFocusedNode(node);
  };

  const handlePressAbove = () => {
    if (!isRoot) {
      // Find the parent node
      const parent = findParent(TestRoot, node);
      if (parent) {
        setFocusedNode(parent);
      }
    }
  };

  // Find which child is on the path to the focused node
  const getChildOnPath = () => {
    if (!focusedNode) return null;
    return node.children.find(child => isOnPathToFocusedNode(child, focusedNode));
  };

  const childOnPath = getChildOnPath();

  return (
    <View>
      <Pressable onPress={handlePress}>
        <View style={[styles.nodeContainer, isFocused && styles.focusedNode]}>
          <Text style={styles.nodeTitle}>{node.title}</Text>
        </View>
      </Pressable>
      
      {shouldRenderChildren && (
        <View style={styles.childrenContainer}>
          <Pressable style={styles.aboveArea} onPress={handlePressAbove} />
          {node.children.map(child => (
            <NoteTree
              key={child.id}
              node={child}
              focusedNode={focusedNode}
              setFocusedNode={setFocusedNode}
              isOnPathToFocused={child.id === childOnPath?.id}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// Helper function to check if a node is on the path to the focused node
function isOnPathToFocusedNode(node: Node, focusedNode: Node): boolean {
  if (node.id === focusedNode.id) return true;
  return node.children.some(child => isOnPathToFocusedNode(child, focusedNode));
}

// Helper function to find the parent of a node
function findParent(root: Node, target: Node): Node | null {
  if (!root.children) return null;
  if (root.children.some(child => child.id === target.id)) return root;
  
  for (const child of root.children) {
    const parent = findParent(child, target);
    if (parent) return parent;
  }
  
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  nodeContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  focusedNode: {
    backgroundColor: '#f0f0f0',
  },
  nodeTitle: {
    fontSize: 16,
    color: '#000',
  },
  childrenContainer: {
    marginLeft: 20,
  },
  aboveArea: {
    height: 20,
    backgroundColor: 'transparent',
  },
});
