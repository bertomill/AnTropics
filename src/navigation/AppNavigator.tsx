import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';

// Placeholder screens - we'll create these next
const HomeScreen = () => <Text>Home</Text>;
const BreakScreen = () => <Text>Break Time</Text>;
const CompanionScreen = () => <Text>AI Companion</Text>;
const StatsScreen = () => <Text>Stats & Progress</Text>;
const PetScreen = () => <Text>Virtual Pet</Text>;

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#999',
          headerShown: true,
        }}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'Tropic'}}
        />
        <Tab.Screen
          name="Break"
          component={BreakScreen}
          options={{title: 'Take a Break'}}
        />
        <Tab.Screen
          name="Companion"
          component={CompanionScreen}
          options={{title: 'AI Companion'}}
        />
        <Tab.Screen
          name="Pet"
          component={PetScreen}
          options={{title: 'My Pet'}}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{title: 'Progress'}}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
