import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import axiosInstance from './../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfilePage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold' },
  logoutButton: {
    padding: 10, 
    backgroundColor: '#dc3545', 
    borderRadius: 5,
  },
  logoutText: { 
    color: '#fff', 
    fontWeight: 'bold' },
});
