import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import * as Font from "expo-font";

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        Pacifico: require("@/assets/fonts/Pacifico.ttf"),
        SourGummy: require("@/assets/fonts/SourGummy.ttf"),
      });
      setFontsLoaded(true);
    }

    loadFonts();
  }, [])

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Index", headerShown: false }} />
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="signup" options={{ title: "Signup", headerShown: false }} />
      <Stack.Screen name="home" options={{ title: "Home", headerShown: false }} />
      <Stack.Screen name="profileModify" options={{ title: "ProfileModify", headerShown: false }}/>
      <Stack.Screen name="settings" options={{ title: "Settings", headerShown: false }} />

    </Stack>
  );
}
