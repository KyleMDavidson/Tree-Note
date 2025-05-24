import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import { TestRoot } from '../../src/models/fixtures';
import { Node, NodeTouchableBounds } from '../../src/models/types';


// Add a new type that includes the path marking
type MarkedNode = Node & {
  isOnPathToFocused?: boolean;
};



const NotesScreen = () => {
  const [rootNode, setRootNode] = useState<MarkedNode | null>(TestRoot as MarkedNode);
  const [focusedNode, setFocusedNode] = useState<Partial<MarkedNode> | null>(TestRoot as MarkedNode);
  const pressedNodeId = useRef<Number>(null)
  const [touchStartTime, setTouchStartTime] = useState<number | null>(null);
  const [currentTouchNode, setCurrentTouchNode] = useState<MarkedNode | null>(null);
  const componentBounds = useRef<NodeTouchableBounds>({})


  useEffect(()=>{
    console.log(`component bounds changed`);
    console.log(componentBounds.current)

  }, [componentBounds])

  const handleSetFocusedNode = (node: MarkedNode) => {
    // clear all path markings

    if (rootNode) clearPathMarkings(rootNode);

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

    if (rootNode) markPathToFocused(rootNode, node);
    setFocusedNode(node);
  };

  const registerDimensions = useCallback((id, x,y,width,height )=>{componentBounds.current[id]={x:x,y:y,width:width,height:height}},[])
  const handleLayout= useCallback((id: number, touchTargetRef: any) => {
    if (touchTargetRef.current) {
      touchTargetRef.current.measureInWindow((x, y, width, height) => registerDimensions(id, x,y,width,height));
      };
  },[])

  const ResponderConfig = {
 onResponderMove: (e)=>{console.log('responder move.');const node = findTouchedNode(componentBounds, e.nativeEvent.locationX, e.nativeEvent.locationY);console.log(`found node: ${JSON.stringify(node)} for location ${e.nativeEvent.locationX}`);node ? node!= focusedNode ? handleSetFocusedNode(node): null : null},
  onMoveShouldSetResponder:(e)=>true,
   onResponderTerminationRequest: (e)=>true,
    onResponderGrant: (e)=>console.log(`responder granted in node ${e.target}`),
  }


  return (
    //superior for performance to pan responder (which is more liable to suffer locks on the thread)
    <View style={{flex: 1}}>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={Gesture.Pan()}>
        <View style={styles.container}>
          {rootNode && 
 <View {...ResponderConfig}>
              <NoteTree 
                node={rootNode} 
                focusedNode={focusedNode}
                isRoot={true}
                touchStartTime={touchStartTime}
                setTouchStartTime={setTouchStartTime}
                currentTouchNode={currentTouchNode}
                setCurrentTouchNode={setCurrentTouchNode}
                handleLayout={handleLayout}
              />
              </View>
          }
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
    <Button title={"collapse"} onPress={()=>{if (rootNode){clearPathMarkings(rootNode); setRootNode(rootNode); setFocusedNode(null)}}}/>
      </View>
  );
}

function clearPathMarkings(n: MarkedNode){
  n.isOnPathToFocused = false

  n.children.forEach(clearPathMarkings);
};

function findTouchedNode(componentBounds, x, y){
  console.log(`componetn bounds ref: ${JSON.stringify(componentBounds.current)}`)
  console.log(`touched x, y: ${x} ${y}`)
  for (const [id, node] of Object.entries(componentBounds.current)) {
    if (
      x >= node.x &&
      x <= node.x + node.width &&
      y >= node.y &&
      y <= node.y + node.height
    ) {
      return { id: parseInt(id), ...node };
    }
  }
  return null;
};



function NoteTree({ 
  node, 
  focusedNode, 
  setFocusedNode,
  isRoot = false,
  touchStartTime,
  setTouchStartTime,
  currentTouchNode,
  setCurrentTouchNode,
  handleLayout
}: { 
  node: MarkedNode;
  focusedNode: Partial<MarkedNode> | null;
  setFocusedNode: (node: MarkedNode) => void;
  isRoot?: boolean;
  touchStartTime: number | null;
  setTouchStartTime: (time: number | null) => void;
  currentTouchNode: MarkedNode | null;
  setCurrentTouchNode: (node: MarkedNode | null) => void;
  handleLayout: (id: number, touchTarget: any) =>void;
}) {
  const isFocused = focusedNode?.id === node.id;
  const shouldRenderChildren = node.isOnPathToFocused && node.children.length > 0;
  const isBeingPressed = currentTouchNode?.id === node.id;
  const touchTargetBoundsRef = useRef(null)

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
    <View ref={touchTargetBoundsRef} onLayout={(e)=>handleLayout(node.id, touchTargetBoundsRef)}>
        <Text style={styles.nodeTitle}>{node.title}</Text></View>
      {shouldRenderChildren && (
        <View style={styles.childrenContainer}>
          {node.children.map(child => (
            <NoteTree
            handleLayout={handleLayout}
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
