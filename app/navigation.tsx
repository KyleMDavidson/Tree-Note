import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { IconSymbol } from '@/components/ui/IconSymbol';

// Import screens directly
import HomeScreen from './screens/HomeScreen';
import NotesScreen from './screens/NotesScreen';

console.log('NotesScreen component:', NotesScreen);
console.log('HomeScreen component:', HomeScreen);

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer fallback={<Text>Loading...</Text>}>
        <Tab.Navigator
          initialRouteName="Notes"
          screenOptions={{
            headerShown: false,
          }}>
          <Tab.Screen
            name="Notes"
            component={NotesScreen}
            options={{
              title: 'Notes',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="note.text" color={color} />,
            }}
          />
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
    </SafeAreaView>
  );
} 