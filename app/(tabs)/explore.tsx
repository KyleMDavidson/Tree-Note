import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TestRoot } from '../fixtures';
import { Node } from '../types';

// Add a new type that includes the path marking
type MarkedNode = Node & {
  isOnPathToFocused?: boolean;
};

export default function ExplorerScreen() {
  const [rootNote, setRootNode] = useState<MarkedNode | null>(TestRoot as MarkedNode);
  const [focusedNode, setFocusedNode] = useState<MarkedNode | null>(TestRoot as MarkedNode);

  const handleSetFocusedNode = (node: MarkedNode) => {
    // Create a new copy of the root note to trigger a re-render
    const newRoot = { ...rootNote! };
    
    // First, clear all path markings
    const clearPathMarkings = (n: MarkedNode) => {
      n.isOnPathToFocused = false;
      n.children.forEach(clearPathMarkings);
    };
    clearPathMarkings(newRoot);

    // Then mark the path to the new focused node
    const markPathToFocused = (n: MarkedNode, target: MarkedNode): boolean => {
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
    };

    markPathToFocused(newRoot, node);
    setRootNode(newRoot);
    setFocusedNode(node);
  };

  return (
    <View style={styles.container}>
      {rootNote && 
          <NoteTree 
            node={rootNote} 
            focusedNode={focusedNode}
            setFocusedNode={handleSetFocusedNode}
            isRoot={true}
          />
      }
    </View>
  );
}

function NoteTree({ 
  node, 
  focusedNode, 
  setFocusedNode,
  isRoot = false
}: { 
  node: MarkedNode;
  focusedNode: MarkedNode | null;
  setFocusedNode: (node: MarkedNode) => void;
  isRoot?: boolean;
}) {
  const isFocused = focusedNode?.id === node.id;
  const shouldRenderChildren = node.isOnPathToFocused && node.children.length > 0;

  const handlePress = () => {
    setFocusedNode(node);
  };

  const handlePressAbove = () => {
    if (!isRoot) {
      const parent = findParent(TestRoot as MarkedNode, node);
      if (parent) {
        setFocusedNode(parent);
      }
    }
  };

  return (
    <View>
      <Pressable onPressOut={handlePress}>
        <View style={[
          styles.nodeContainer, 
          isFocused && styles.focusedNode
        ]}>
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
              isRoot={false}
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
