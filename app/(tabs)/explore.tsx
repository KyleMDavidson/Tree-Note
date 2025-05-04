import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Note } from '../types';

export default function ExplorerScreen() {
  let [rootNote, setRootNode] = useState<Note |null>(null);


  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>da hell</Text>
      </View>
    </ScrollView>
  );
}


//this returns a component which uses DnDKit
function NoteTree(notes: note[]){

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
