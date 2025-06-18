import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MealsListScreen from './index';
import CreateMealScreen from './createmeal';
import EditMealScreen from './editmeal';
import MyMealsByProfileScreen from './listmeal';

export type MealsStackParamList = {
  MealsList: undefined;
  CreateMeal: undefined;
  EditMeal: { mealId: string };
  MyMeals: undefined;
};

const MealsStack = createNativeStackNavigator<MealsStackParamList>();

const MealsStackScreen = () => (
  <MealsStack.Navigator screenOptions={{ headerShown: false }}>
    <MealsStack.Screen name="MealsList" component={MealsListScreen} />
    <MealsStack.Screen name="CreateMeal" component={CreateMealScreen} />
    <MealsStack.Screen name="EditMeal" component={EditMealScreen} />
    <MealsStack.Screen name="MyMeals" component={MyMealsByProfileScreen} />
  </MealsStack.Navigator>
);

export default MealsStackScreen;
