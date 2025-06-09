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
  
  export type TabParamList = {
    Profile: undefined;
    Ingredients: undefined;
    Meals: { screen?: keyof MealsStackParamList };
    Settings: undefined;
  };
  

const MealsStack = createNativeStackNavigator<MealsStackParamList>();

const MealsStackScreen = () => (
  <MealsStack.Navigator>
    <MealsStack.Screen
      name="MealsList"
      component={MealsListScreen}
      options={{ title: 'Meals' }}
    />
    <MealsStack.Screen
      name="CreateMeal"
      component={CreateMealScreen}
      options={{ title: 'Create Meal' }}
    />
    <MealsStack.Screen
      name="EditMeal"
      component={EditMealScreen}
      options={{ title: 'Edit Meal' }}
    />
    <MealsStack.Screen
      name="MyMeals"
      component={MyMealsByProfileScreen}
      options={{ title: 'Meals by profile' }}
    />
  </MealsStack.Navigator>
);

export default MealsStackScreen;
