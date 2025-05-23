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
    const fetchUserProfiles = async () => {
      try {

        const storedUserId = await AsyncStorage.getItem('userId');
        console.log('storedUserId:', storedUserId);
        if (storedUserId) {
          setUserId(parseInt(storedUserId));

          const response = await axiosInstance.get(`get/profiles/${storedUserId}`);

          if (response.status === 200) {
            setEmail(response.data.email);
            setProfiles(response.data.profiles);
          }
        } else {
          Alert.alert('Error', 'No user ID found. Please log in again.');
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
        Alert.alert('Error', 'Failed to fetch profiles.');
      }
      console.log('Profiles:', profiles);
    };

    fetchUserProfiles();
  }, []);

  const handleProfileClick = (profileId: number) => {
    router.push({
      pathname: '/tabs/profile',
      params: { profileId: profileId.toString() },
    } as any);
  };
  
  const handleCreateProfile = () => {
    router.push('/profileSignup');
  };

  return (
    <View style={styles.container}>

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