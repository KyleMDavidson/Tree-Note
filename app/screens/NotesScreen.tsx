import { SyntheticEvent, useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import { TestRoot } from '../../src/models/fixtures';
import { Node } from '../../src/models/types';

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
  const componentBounds = useRef({})

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
    componentBounds.current = {}
  };


  const handleLayoutCallback: (id: number, event: SyntheticEvent)=> void = useCallback(
  (id, event) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    console.log(`updating comp bounds ${JSON.stringify(componentBounds.current)} ${[x,y,width,height]}`)
    componentBounds.current[id] = { x, y, width, height };
  },[])


  function findTouchedNode(event){
    // Find which component is under the touch
    const { x, y } = event;
    for (const [id, bounds] of Object.entries(pressedNodeId.current)) {
      if (
        x >= bounds.x &&
        x <= bounds.x + bounds.width &&
        y >= bounds.y &&
        y <= bounds.y + bounds.height
      ) {
        setFocusedNode({id: parseInt(id)});
        console.log(`Press started on component: ${id}`);
        break;
      }
    }
  }


  const pan = Gesture.Pan()
  .onBegin((event) =>findTouchedNode(event))
  .onUpdate((event) => {
    // Update pressed component based on touch position
    const { x, y } = event;
    let newPressedId = null;
    for (const [id, bounds] of Object.entries(componentBounds.current)) {
      if (
        x >= bounds.x &&
        x <= bounds.x + bounds.width &&
        y >= bounds.y &&
        y <= bounds.y + bounds.height
      ) {
        newPressedId = id;
        break;
      }
    }
    if (newPressedId !== pressedNodeId.current) {
      pressedNodeId.current = newPressedId;
      console.log(`Press moved to component: ${newPressedId || 'None'}`);
      pressedNodeId.current = newPressedId
      setFocusedNode(newPressedId);
    }
  })
  .onFinalize(() => {
    pressedNodeId.current = null;
    console.log('Press ended');
  });

  const ResponderConfig = {
 onResponderMove: ()=>console.log(`moving in ${node.id}`),
  onMoveShouldSetResponder:()=>{console.log(`onMoveShouldSEtin ${node.id}`); setFocusedNode(node);return true},
   onResponderTerminationRequest: (e)=>true,
    onResponderGrant: (e)=>console.log(`responder granted in node ${node.id}`)
  }



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
                setFocusedNode={handleSetFocusedNode}
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
  console.log(`handleLayoutCallback: ${handleLayoutCallback} in node ${node.id}`)
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
    <View onLayout={(e)=>handleLayoutCallback(node.id, e)}><Text style={styles.nodeTitle}>{node.title}</Text></View>
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
