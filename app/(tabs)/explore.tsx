import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { TestRoot } from '../fixtures';
import { Node } from '../types';


export default function ExplorerScreen() {
  let [rootNote, setRootNode] = useState<Node |null>(TestRoot);
  console.log(`testRoot: ${JSON.stringify(TestRoot)}`);

  return (
    <ScrollView style={styles.container}>
        <Text style={styles.text}>da hell</Text>
        {rootNote && <NoteTree node={rootNote} />}
    </ScrollView>
  );
}


//this returns a component which uses DnDKit
//this is using implicit structure - non-leafs are traversible, while leafs are displayable
function NoteTree(node: Node){
  if (node.children.length > 0){
  node.children.map((node) => {
    return (
      <NoteTree node={node} />
    )
  })
}
else{
  return (
    <View>
      <Text>{node.title}</Text>
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
