import { Stack } from "expo-router";
import React from 'react';


export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Index' }} />
      <Stack.Screen name="login" options={{ title: 'Login'}} />
      <Stack.Screen name="signup" options={{ title: 'Signup' }} />
      <Stack.Screen name="home" options={{ title: 'Home' }} />
      <Stack.Screen name="profileModify" options={{ title: 'ProfileModify' }} />
    </Stack>
  );  
  }
