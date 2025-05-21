import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Profile from './profile';
//import Activity from './Activity';
//import Diet from './Diet';
import Settings from './settings';
import { NavigationContainer } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const TabLayout = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Activity') {
              iconName = focused ? 'fitness' : 'fitness-outline';
            } else if (route.name === 'Diet') {
              iconName = focused ? 'restaurant' : 'restaurant-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Profile" component={Profile} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default TabLayout;