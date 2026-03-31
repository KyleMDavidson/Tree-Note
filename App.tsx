import 'expo-dev-client';
import { useState } from 'react';
import { AppRegistry } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Login from './features/auth/Login';
import Notes from './features/notes/Notes';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {loggedIn ? (
        <Notes />
      ) : (
        <Login onLogin={() => setLoggedIn(true)} />
      )}
    </GestureHandlerRootView>
  );
}

AppRegistry.registerComponent('main', () => App);

export default App;
