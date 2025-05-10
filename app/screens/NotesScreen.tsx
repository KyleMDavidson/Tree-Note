import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import { TestRoot } from '../../src/models/fixtures';
import { Node, NodeTouchableBounds } from '../../src/models/types';


// Add a new type that includes the path marking
type MarkedNode = Node & {
  isOnPathToFocused?: boolean;
};


const NotesScreen = () => {
  const [rootNote, setRootNode] = useState<MarkedNode | null>(TestRoot as MarkedNode);
  const [focusedNode, setFocusedNode] = useState<Partial<MarkedNode> | null>(TestRoot as MarkedNode);
  const pressedNodeId = useRef<Number>(null)
  const [touchStartTime, setTouchStartTime] = useState<number | null>(null);
  const [currentTouchNode, setCurrentTouchNode] = useState<MarkedNode | null>(null);
  const componentBounds = useRef<NodeTouchableBounds>({})


  const findTouchedNode = useCallback((x, y):(Node | null) =>{
    for (const [id, node] of Object.entries(componentBounds.current)) {
      if (
        x >= node.x &&
        x <= node.x + node.width &&
        y >= node.y &&
        y <= node.y + node.height
      ) {
        return {id: parseInt(id), ...node};
      }
    }
    return null;
  }, [componentBounds])


  const handleSetFocusedNode = (node: MarkedNode) => {
    // clear all path markings

    const clearPathMarkings = (n: MarkedNode) => {
      n.isOnPathToFocused = false;

      n.children.forEach(clearPathMarkings);
    };

    if (rootNote) clearPathMarkings(rootNote);

    // mark the path to the new focused node
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


  const handleLayoutCallback = useCallback((node, event)=>{
    componentBounds.current[node.id] ={ x: event.nativeEvent.layout.x,  y: event.nativeEvent.layout.y, width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height, node: node}
  }, [])


  //ok so, we really don't need this. we can grab locations in layout, and then just check position here.
  const ResponderConfig = {
 onResponderMove: (e)=>{console.log('responder move.');const node = findTouchedNode(e.nativeEvent.locationX, e.nativeEvent.locationY);console.log(`found node: ${JSON.stringify(node)}`);node ? setFocusedNode(node): null},

 //this fires it way up.
 //onResponderMove: (e)=>{console.log(`moving in ${e.nativeEvent.locationX}`);console.log(`componentbounds: ${JSON.stringify(componentBounds.current)}`);console.log(findTouchedNode(e.nativeEvent.locationX, e.nativeEvent.locationY))
  onMoveShouldSetResponder:(e)=>true,
   onResponderTerminationRequest: (e)=>true,
    onResponderGrant: (e)=>console.log(`responder granted in node ${e.target}`)
  }


  //we'll pass this to our react native view's on layout.

  return (
    //superior for performance to pan responder (which is more liable to suffer locks on the thread)
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={Gesture.Pan()}>
        <View style={styles.container}>
          {rootNote && 
 <View {...ResponderConfig}>
              <NoteTree 
                node={rootNote} 
                focusedNode={focusedNode}
                isRoot={true}
                touchStartTime={touchStartTime}
                setTouchStartTime={setTouchStartTime}
                currentTouchNode={currentTouchNode}
                setCurrentTouchNode={setCurrentTouchNode}
                handleLayoutCallback={handleLayoutCallback}
              />
              </View>
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
  setCurrentTouchNode,
  handleLayoutCallback
}: { 
  node: MarkedNode;
  focusedNode: Partial<MarkedNode> | null;
  setFocusedNode: (node: MarkedNode) => void;
  isRoot?: boolean;
  touchStartTime: number | null;
  setTouchStartTime: (time: number | null) => void;
  currentTouchNode: MarkedNode | null;
  setCurrentTouchNode: (node: MarkedNode | null) => void;
  handleLayoutCallback: (id: number, event: Event) =>void;
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
    <View onLayout={(e)=>handleLayoutCallback(node, e)}><Text style={styles.nodeTitle}>{node.title}</Text></View>
      {shouldRenderChildren && (
        <View style={styles.childrenContainer}>
          {node.children.map(child => (
            <NoteTree
            handleLayoutCallback={handleLayoutCallback}
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
