import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Index from './index';
import Login from './login';
import Signup from './signup';
import Home from './home';

import TabsLayout from './tabs/_layout';
import CreateMealScreen from './tabs/meals/createmeal';
import MealsListScreen from './tabs/meals';
import MyMealsByProfileScreen from './tabs/meals/listmeal';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [userAuthenticated, setUserAuthenticated] = useState<boolean | null>(null);
  const [profileSelected, setProfileSelected] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const profileId = await AsyncStorage.getItem('profileId');
      setUserAuthenticated(!!token);
      setProfileSelected(!!profileId);
    };

    checkAuth();
  }, []);

  if (userAuthenticated === null) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!userAuthenticated ? (
        <>
          <Stack.Screen name="Index" component={Index} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
        </>
      ) : !profileSelected ? (
        <>
          <Stack.Screen name="Index" component={Index} />
        </>
      ) : (
        <>
          <Stack.Screen name="Tabs" component={TabsLayout} />
          <Stack.Screen name="CreateMeal" component={CreateMealScreen} />
          <Stack.Screen name="MyMeals" component={MyMealsByProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
