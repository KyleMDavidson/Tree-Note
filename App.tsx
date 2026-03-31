import 'expo-dev-client';
import { AppRegistry } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Notes from './features/notes/Notes';


function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Notes />
    </GestureHandlerRootView>
  );
}

AppRegistry.registerComponent('main', () => App);

export default App; 