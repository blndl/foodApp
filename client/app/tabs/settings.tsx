import React, { useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import axiosInstance from '../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function Settings() {
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

  const handleModifyProfile = () => {
    router.push({
      pathname: '../profileModify',
      params: { profileId }
    });
  };

  const handleDeleteProfile = async () => {
    try {
      await axiosInstance.delete(`/profiles/delete/profile/${profileId}`);
      console.log('Profile deleted');
      router.push('/home');
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('profileId');
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Hello, {profile?.profileName || 'User'}</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
      <Text style={styles.title}>Settings</Text>

      <Button title="Modify Profile" onPress={handleModifyProfile} />
      <View style={{ marginTop: 20 }}>
        <Button title="Delete Profile" color="red" onPress={handleDeleteProfile} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
});