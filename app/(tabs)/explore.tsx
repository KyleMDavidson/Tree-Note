import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Leaf, Node } from '../types';



export default function ExplorerScreen() {
  let [rootNote, setRootNode] = useState<Node |null>(null);
  let a : Leaf = {
    id: 1,
    children: [],
    title: 'Hello',
    content: 'World',
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>da hell</Text>
      </View>
    </ScrollView>
  );
}


//this returns a component which uses DnDKit
//this is using implicit structure - non-leafs are traversible, while leafs are displayable
function NoteTree(note: Note[]){
  if (note.children.length > 0){
  note.map((note) => {
    return (
      <View>
        <Text>{note.title}</Text>
      </View>
    )
  })
}
else{
  return (
    <View>
      <Text>{note.title}</Text>
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
