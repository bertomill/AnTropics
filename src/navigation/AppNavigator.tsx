import React from 'react';
import {Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import BreakScreen from '../screens/BreakScreen';
import CompanionScreen from '../screens/CompanionScreen';
import StatsScreen from '../screens/StatsScreen';
import PetScreen from '../screens/PetScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#999',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#FFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Tropic',
            tabBarLabel: 'Home',
            tabBarIcon: ({color, size}) => <TabIcon icon="🏠" color={color} />,
          }}
        />
        <Tab.Screen
          name="Break"
          component={BreakScreen}
          options={{
            title: 'Take a Break',
            tabBarLabel: 'Exercise',
            tabBarIcon: ({color, size}) => <TabIcon icon="🧘" color={color} />,
          }}
        />
        <Tab.Screen
          name="Companion"
          component={CompanionScreen}
          options={{
            title: 'AI Companion',
            tabBarLabel: 'Chat',
            tabBarIcon: ({color, size}) => <TabIcon icon="💬" color={color} />,
          }}
        />
        <Tab.Screen
          name="Pet"
          component={PetScreen}
          options={{
            title: 'My Companion',
            tabBarLabel: 'Pet',
            tabBarIcon: ({color, size}) => <TabIcon icon="🌱" color={color} />,
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            title: 'Progress',
            tabBarLabel: 'Stats',
            tabBarIcon: ({color, size}) => <TabIcon icon="📊" color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Simple emoji-based tab icon component
function TabIcon({icon, color}: {icon: string; color: string}) {
  return (
    <Text style={{fontSize: 24, opacity: color === '#4CAF50' ? 1 : 0.5}}>
      {icon}
    </Text>
  );
}
