// tabs/_layout.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Profile from './profile';
import Ingredients from './ingredients';
import Settings from './settings';
import MealsStackScreen from './meals/_layout';

import { NavigatorScreenParams } from '@react-navigation/native';
import { MealsStackParamList } from './meals/_layout';

export type TabsParamList = {
  Profile: undefined;
  Ingredients: undefined;
  Meals: NavigatorScreenParams<MealsStackParamList>;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

const TabsLayout = () => (
  <Tab.Navigator
    initialRouteName="Profile"
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName = '';
        if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        else if (route.name === 'Ingredients') iconName = focused ? 'fish' : 'fish-outline';
        else if (route.name === 'Meals') iconName = focused ? 'restaurant' : 'restaurant-outline';
        else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Profile" component={Profile} />
    <Tab.Screen name="Ingredients" component={Ingredients} />
    <Tab.Screen name="Meals" component={MealsStackScreen} />
    <Tab.Screen name="Settings" component={Settings} />
  </Tab.Navigator>
);

export default TabsLayout;
