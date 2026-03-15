import 'expo-dev-client';
import { AppRegistry } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from './app/navigation';
import {Text} from 'react-native'


function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Navigation />
    </GestureHandlerRootView>
  );
}

AppRegistry.registerComponent('main', () => App);

export default App; 