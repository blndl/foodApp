import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function AuthCheck() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAccess() {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const userId = await AsyncStorage.getItem('userId');
      const profileId = await AsyncStorage.getItem('profileId');

      if (!accessToken || !userId) {
        router.replace('../index'); // Not authenticated
        return;
      }

      if (!profileId) {
        router.replace('/home'); // No profile setup
        return;
      }

      router.replace('/tabs/profile'); // ✅ Redirect to main app (or any valid route)
    }

    checkAccess();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
