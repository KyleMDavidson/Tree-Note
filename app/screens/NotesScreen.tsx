import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import { TestRoot } from '../../src/models/fixtures';
import { Node } from '../../src/models/types';

// Add a new type that includes the path marking
type MarkedNode = Node & {
  isOnPathToFocused?: boolean;
};

const NotesScreen = () => {
  const [rootNote, setRootNode] = useState<MarkedNode | null>(TestRoot as MarkedNode);
  const [focusedNode, setFocusedNode] = useState<MarkedNode | null>(TestRoot as MarkedNode);
  const [touchStartTime, setTouchStartTime] = useState<number | null>(null);
  const [currentTouchNode, setCurrentTouchNode] = useState<MarkedNode | null>(null);

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
    //superior for performance to pan responder (which is more liable to suffer locks on the thread)
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={Gesture.Pan()}>
        <View style={styles.container}>
          {rootNote && 
              <NoteTree 
                node={rootNote} 
                focusedNode={focusedNode}
                setFocusedNode={handleSetFocusedNode}
                isRoot={true}
                touchStartTime={touchStartTime}
                setTouchStartTime={setTouchStartTime}
                currentTouchNode={currentTouchNode}
                setCurrentTouchNode={setCurrentTouchNode}
              />
          }
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

function NoteTree({ 
  node, 
  focusedNode, 
  setFocusedNode,
  isRoot = false,
  touchStartTime,
  setTouchStartTime,
  currentTouchNode,
  setCurrentTouchNode
}: { 
  node: MarkedNode;
  focusedNode: MarkedNode | null;
  setFocusedNode: (node: MarkedNode) => void;
  isRoot?: boolean;
  touchStartTime: number | null;
  setTouchStartTime: (time: number | null) => void;
  currentTouchNode: MarkedNode | null;
  setCurrentTouchNode: (node: MarkedNode | null) => void;
}) {
  const isFocused = focusedNode?.id === node.id;
  const shouldRenderChildren = node.isOnPathToFocused && node.children.length > 0;
  const isBeingPressed = currentTouchNode?.id === node.id;

  const handlePress = () => {
    console.log('handlepress')
    setFocusedNode(node);
  };

  const handlePressAbove = () => {
    if (!isRoot) {
      const parent = findParent(TestRoot as MarkedNode, node);
      if (parent) {
        setFocusedNode(parent);
      }
    }
  }

  return (
    <View>
         <Pressable onPressIn={handlePress}><Text style={styles.nodeTitle}>{node.title}</Text></Pressable>
      
      {shouldRenderChildren && (
        <View style={styles.childrenContainer}>
          {node.children.map(child => (
            <NoteTree
              key={child.id}
              node={child}
              focusedNode={focusedNode}
              setFocusedNode={setFocusedNode}
              isRoot={false}
              touchStartTime={touchStartTime}
              setTouchStartTime={setTouchStartTime}
              currentTouchNode={currentTouchNode}
              setCurrentTouchNode={setCurrentTouchNode}
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
  nodeTitle: {
    fontSize: 20,
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

export default NotesScreen;
