import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Stack } from 'expo-router';

export default function NotFoundScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRedirect = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const profileId = await AsyncStorage.getItem('profileId');

      if (userId && profileId) {
        router.replace('/tabs/profile');
      } else if (userId && !profileId) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error reading AsyncStorage:', error);
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'How did you even get here ?' }} />
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <>
            <Text style={styles.message}>You seem lost!</Text>
            <TouchableOpacity onPress={handleRedirect} style={styles.button}>
              <Text style={styles.buttonText}>Go back to the right place</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});