import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import axiosInstance from './../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfilePage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calories, setCalories] = useState<number | null>(null);
  const [dri, setDri] = useState<any>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const storedProfileId = await AsyncStorage.getItem('profileId');
      if (!storedProfileId) {
        Alert.alert('Error', 'No profile ID found. Please log in again.');
        router.replace('/home');
        return;
      }

      const parsedProfileId = parseInt(storedProfileId);
      if (isNaN(parsedProfileId)) {
        Alert.alert('Error', 'Invalid profile ID found. Please log in again.');
        router.replace('/home');
        return;
      }

      setProfileId(parsedProfileId);

      const response = await axiosInstance.get(`profiles/get/profile/${parsedProfileId}`);
      if (response.status === 200) {
        setProfile(response.data);
        calculateDRI(response.data);
      } else {
        setError('Profile not found');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      Alert.alert('Error', 'Failed to fetch profile data.');
      setError('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const calculateDRI = (profileData: any) => {
    const { weight, activityLevel } = profileData;

    let multiplier = 30;
    if (activityLevel === 'a bit') multiplier = 25;
    else if (activityLevel === 'a lot') multiplier = 30;
    else if (activityLevel === 'professional level') multiplier = 35;

    const weightKg = parseFloat(weight);
    const estimatedCalories = weightKg * multiplier;

    setCalories(estimatedCalories);

    const proteinGrams = [estimatedCalories * 0.10 / 4, estimatedCalories * 0.30 / 4];
    const fatGrams = [estimatedCalories * 0.20 / 9, estimatedCalories * 0.35 / 9];
    const carbsGrams = [estimatedCalories * 0.45 / 4, estimatedCalories * 0.65 / 4];
    const waterLiters = estimatedCalories / 1000;
    const fiberGrams = (estimatedCalories / 1000) * 14;

    setDri({
      protein: proteinGrams.map(v => v.toFixed(1)),
      fat: fatGrams.map(v => v.toFixed(1)),
      carbs: carbsGrams.map(v => v.toFixed(1)),
      water: waterLiters.toFixed(2),
      fiber: fiberGrams.toFixed(1),
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('profileId');
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red' }}>{error}</Text>
        <TouchableOpacity onPress={() => router.replace('/home')}>
          <Text style={{ color: 'blue', marginTop: 10 }}>Go Back Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hello, {profile?.profileName || 'User'}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text>Age: {profile?.age}</Text>
      <Text>Gender: {profile?.gender}</Text>
      <Text>Height: {profile?.height}</Text>
      <Text>Weight: {profile?.weight}</Text>
      <Text>Activity Level: {profile?.activityLevel}</Text>
      <Text>Objective: {profile?.objective}</Text>
      <Text>Diet: {profile?.diet}</Text>

      <View style={{ marginTop: 30 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Recommended Daily Intake:</Text>
        {calories && <Text>Estimated Calories: {Math.round(calories)} kcal/day</Text>}
        {dri && (
          <>
            <Text>Protein: {dri.protein[0]} – {dri.protein[1]} g</Text>
            <Text>Fat: {dri.fat[0]} – {dri.fat[1]} g</Text>
            <Text>Carbohydrates: {dri.carbs[0]} – {dri.carbs[1]} g</Text>
            <Text>Water: {dri.water} L</Text>
            <Text>Fiber: {dri.fiber} g</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 10,
    backgroundColor: '#dc3545',
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
