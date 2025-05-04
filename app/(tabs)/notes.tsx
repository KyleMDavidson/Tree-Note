import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Notes() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>da fuk</Text>
      </View>
    </ScrollView>
  );
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
