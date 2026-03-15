import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView, Text } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';

import Home from '@/features/home/Home';
import Notes from '@/features/notes/Notes';

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer fallback={<Text>Loading...</Text>}>
        <Tab.Navigator
          initialRouteName="Notes"
          screenOptions={{
            headerShown: false,
          }}>
          <Tab.Screen
            name="Notes"
            component={Notes}
            options={{
              title: 'Notes',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="note.text" color={color} />,
            }}
          />
          <Tab.Screen
            name="Home"
            component={Home}
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
} 