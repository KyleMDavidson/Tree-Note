import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { TestRoot } from '../fixtures';
import { Node } from '../types';


export default function ExplorerScreen() {
  let [rootNote, setRootNode] = useState<Node |null>(TestRoot);

  return (
    <ScrollView style={styles.container}>
        {rootNote && <NoteTree node={rootNote} />}
    </ScrollView>
  );
}


//this returns a component which uses DnDKit
//this is using implicit structure - non-leafs are traversible, while leafs are displayable
//this is a recursive function which returns a component has the folowing features:
//definition of focused here: this meants that the NoteTree leading to the NoteTree is rendered, e.g. all ancestors in the tree the current note tree is a leaf of, and the node and this node's children are rendered, but nothing past the direct children are rendered.
//1. it detects when the part of the screen being Pressed is above the rendered node such that if any node is focused and the area above the rendered node is pressed, the parent node is focused unless the node has no parent.
//2. it has a an ability such that if any NoteTree component is focused (e.g. was last pressed), and any child NoteTree below the rendered node is pressed, that child node is focused.
//3. it has an ability such that if any node is focused and the area above the rendered node (in the form of a notetree component) is pressed, the parent node is focused unless the node has no parent.
function NoteTree({node}: {node: Node}){
  if (node.children.length > 0){
    return(
  <View className='tree-row'>
  <View>
      <Text style={{height: 100, width: 100 }}>{node.title}</Text>
    </View>
{node.children.map((node) => {return <NoteTree key={node.id} node={node} />})}
</View>
    )
}
else{
  return (
    //not actually sure that we need this to be a different class than tree-row.
    //we could just treat it as a special case.
    <View>
      <Text style={{height: 100, width: 100}}>{node.title}</Text>
    </View>
  )
}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  text: {
    color: '#000',
    fontSize: 16,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
