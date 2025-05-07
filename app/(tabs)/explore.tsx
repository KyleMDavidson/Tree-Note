import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TestRoot } from '../fixtures';
import { HoverState, Node } from '../types';

// Add a new type that includes the path marking
type MarkedNode = Node & {
  isOnPathToFocused?: boolean;
};

export default function ExplorerScreen() {
  const [rootNote, setRootNode] = useState<MarkedNode | null>(TestRoot as MarkedNode);
  const [focusedNode, setFocusedNode] = useState<MarkedNode | null>(TestRoot as MarkedNode);
  const [hoverState, setHoverState] = useState<HoverState>({
    isHovering: false,
    hoverStartTime: null,
    hoveredNodeId: null
  });

  const handleSetFocusedNode = (node: MarkedNode) => {
    // First, clear all path markings
    const clearPathMarkings = (n: MarkedNode) => {
      n.isOnPathToFocused = false;
      n.children.forEach(clearPathMarkings);
    };
    if (rootNote) clearPathMarkings(rootNote);

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

    if (rootNote) markPathToFocused(rootNote, node);
    setFocusedNode(node);
  };

  return (
    <View style={styles.container}>
      {rootNote && (
        <NoteTree 
          node={rootNote} 
          focusedNode={focusedNode}
          setFocusedNode={handleSetFocusedNode}
          hoverState={hoverState}
          setHoverState={setHoverState}
          isRoot={true}
        />
      )}
    </View>
  );
}

function NoteTree({ 
  node, 
  focusedNode, 
  setFocusedNode,
  hoverState,
  setHoverState,
  isRoot = false
}: { 
  node: MarkedNode;
  focusedNode: MarkedNode | null;
  setFocusedNode: (node: MarkedNode) => void;
  hoverState: HoverState;
  setHoverState: (state: HoverState) => void;
  isRoot?: boolean;
}) {
  const isFocused = focusedNode?.id === node.id;
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldRenderChildren = isExpanded && node.children.length > 0;
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePressIn = () => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set new hover state
    setHoverState({
      isHovering: true,
      hoverStartTime: Date.now(),
      hoveredNodeId: node.id
    });

    // Set timeout for expansion
    hoverTimeoutRef.current = setTimeout(() => {
      setIsExpanded(true);
    }, 1000);
  };

  const handlePressOut = () => {
    // Clear the timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    setHoverState({
      isHovering: false,
      hoverStartTime: null,
      hoveredNodeId: null
    });
  };

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

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View>
      <Pressable 
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.nodeContainer, isFocused && styles.focusedNode]}>
          <NoteData title={node.title} content={node.content} />
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
              hoverState={hoverState}
              setHoverState={setHoverState}
              isRoot={false}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const NoteData = ({title, content}: {title: string, content: string}) => {
  return (
    <View>
      <Text>{title}</Text>
    </View>
  )
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
