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
