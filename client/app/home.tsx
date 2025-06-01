import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axiosInstance from './axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Home() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedToken = await AsyncStorage.getItem('accessToken');

        if (!storedUserId || !storedToken) {
          router.replace('/login');
          return;
        }
  
        setUserId(parseInt(storedUserId));
  
        const response = await axiosInstance.get(`get/profiles/${storedUserId}`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
  
        if (response.status === 200) {
          setEmail(response.data.email);
          setProfiles(response.data.profiles);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
        Alert.alert('Error', 'Failed to fetch profiles.');
        router.replace('/login');
      }
    };
  
    checkAuthAndFetch();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      Alert.alert('Logged out', 'You have been logged out.');
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleProfileClick = async (profileId: number) => {
    try {
      await AsyncStorage.setItem('profileId', profileId.toString());
      console.log('Profile ID stored:', profileId);
      router.push('/tabs/profile');
    } catch (error) {
      console.error('Failed to store profile ID:', error);
      Alert.alert('Error', 'Could not store profile ID. Please try again.');
    }
  };
  
  const handleCreateProfile = () => {
    router.push('/profileSignup');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

        <Text style={styles.title}>Logged in as {email}</Text>
        <Text style={styles.title}>User Profiles</Text>

      <ScrollView contentContainerStyle={styles.profileList}>
        {profiles.map((profile) => (
          <TouchableOpacity
            key={profile.id}
            style={styles.profileButton}
            onPress={() => handleProfileClick(profile.id)}
          >
            <Text style={styles.profileText}>{profile.profileName}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateProfile}
        >
          <Text style={styles.createText}>+</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f4f4f4',
      padding: 20,
    },
    header: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
      },
    logoutButton: {
        padding: 10, 
        backgroundColor: '#dc3545', 
        borderRadius: 5,
      },
    logoutText: { 
        color: '#fff', 
        fontWeight: 'bold' },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    profileList: {
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
    },
    profileButton: {
      backgroundColor: '#ffffff',
      paddingVertical: 30,
      paddingHorizontal: 20,
      marginBottom: 15,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#007BFF',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileText: {
      color: '#007BFF',
      fontSize: 20,
      fontWeight: '600',
    },
    createButton: {
      backgroundColor: '#28a745',
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    createText: {
      fontSize: 36,
      color: 'white',
      fontWeight: 'bold',
    },
  });