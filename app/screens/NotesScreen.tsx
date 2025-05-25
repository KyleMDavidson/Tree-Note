import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import { ContentfulTestRoot } from '../../src/models/fixtures';
import { Node, NodeTouchableBounds } from '../../src/models/types';


// Add a new type that includes the path marking
type MarkedNode = Node & {
  isOnPathToFocused?: boolean;
};



const NotesScreen = () => {
  const [rootNode, setRootNode] = useState<MarkedNode | null>(ContentfulTestRoot as MarkedNode);
  const [focusedNode, setFocusedNode] = useState<Partial<MarkedNode> | null>(ContentfulTestRoot as MarkedNode);
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

  const handleRemoval=useCallback((id: number)=>{
    // delete componentBounds.current[`${id}`];
    console.log('hadnling removal!');
  }, [])

  const ResponderConfig = {
 onResponderMove: (e)=>{const node = findTouchedNode(componentBounds, e.nativeEvent.locationX, e.nativeEvent.locationY);console.log(`onResponderMove - found node: ${JSON.stringify(node)} for location ${e.nativeEvent.locationX} ${e.nativeEvent.locationY}`);node ? node!= focusedNode ? handleSetFocusedNode(node): null : null},
  onMoveShouldSetResponder:(e)=>true,
  //  onResponderTerminationRequest: (e)=>true,
    // onResponderGrant: (e)=>console.log(`responder granted in node ${e.target}`),
  }


  return (
    //superior for performance to pan responder (which is more liable to suffer locks on the thread)
    <View style={{flex: 1}}>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={Gesture.Pan()}>
        <View>
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
                handleRemoval={handleRemoval}
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
      x > node.x &&
      x < node.x + node.width &&
      y > node.y &&
      y < node.y + node.height
    ) {
      console.log(`found node ${id} w bounds ${node.x} ${node.y}`)
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
  handleLayout,
  handleRemoval
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
  handleRemoval: (id: number)=>void
}) {
  const isFocused = focusedNode?.id === node.id;
  const shouldRenderChildren = node.isOnPathToFocused && node.children.length > 0;
  const isBeingPressed = currentTouchNode?.id === node.id;
  const touchTargetBoundsRef = useRef(null)

  useEffect(()=>{
    // return ()=>handleRemoval(node.id)
    return ()=>console.log('fuck')
  }, [])


    return (
    <View>
 <View style={styles.nodeContainer}> 
    <Text style={styles.nodeTitle} ref={touchTargetBoundsRef} onLayout={(e)=>handleLayout(node.id, touchTargetBoundsRef)}>{node.title}</Text>
        {/* <Text style={styles.nodeTitle}>{node.title}</Text></View> */}
        </View>
      {shouldRenderChildren && (
        <View style={styles.childrenContainer}>
          {node.children.map(child => (
            <NoteTree
            handleLayout={handleLayout}
            handleRemoval={handleRemoval}
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
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  nodeTitle: {
    fontSize: 20,
    color: "dark grey",
    alignSelf: "flex-start",
    margin: 3,
    borderColor: "blue",
    borderWidth: 3
  },
  childrenContainer: {
    marginLeft: 40,
  },
  aboveArea: {
    height: 20,
    backgroundColor: 'transparent',
  },
});

export default NotesScreen;
