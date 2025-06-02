import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axiosInstance from './axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function ProfileModify() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    profileName: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: 'none',
    objective: 'gain weight',
    diet: 'vegan',
  });
  const handleChange = (key: string, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileId = async () => {
      const storedProfileId = await AsyncStorage.getItem('profileId');
      if (storedProfileId) {
        setProfileId(storedProfileId);
      } else {
        Alert.alert('Error', 'No profile ID found.');
        router.push('/home');
      }
    };
    loadProfileId();
  }, []);
  
  useEffect(() => {
    if (!profileId) return;
  
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get(`/get/profile/${profileId}`);
        setProfile({
          profileName: response.data.profileName || '',
          age: response.data.age?.toString() || '',
          gender: response.data.gender || '',
          height: response.data.height?.toString() || '',
          weight: response.data.weight?.toString() || '',
          activityLevel: response.data.activityLevel || 'none',
          objective: response.data.objective || 'gain weight',
          diet: response.data.diet || 'vegan',
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
        Alert.alert('Error', 'Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, [profileId]);
  
  const handleSubmit = async () => {
    if (!profileId) {
      Alert.alert('Error', 'Profile ID is missing');
      return;
    }
    try {
      await axiosInstance.put(`/update/profile/${profileId}`, {
        profileName: profile.profileName,
        age: Number(profile.age),
        gender: profile.gender,
        height: parseFloat(profile.height),
        weight: parseFloat(profile.weight),
        activityLevel: profile.activityLevel,
        objective: profile.objective,
        diet: profile.diet,
      });
  
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Profile Name</Text>
      <TextInput
        style={styles.input}
        value={profile.profileName}
        onChangeText={text => handleChange('profileName', text)}
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={profile.age}
        onChangeText={text => handleChange('age', text)}
      />

      <Text style={styles.label}>Gender</Text>
      <TextInput
        style={styles.input}
        value={profile.gender}
        onChangeText={text => handleChange('gender', text)}
      />

      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={profile.height}
        onChangeText={text => handleChange('height', text)}
      />

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={profile.weight}
        onChangeText={text => handleChange('weight', text)}
      />

      <Text style={styles.label}>Activity Level</Text>
      <Picker
        selectedValue={profile.activityLevel}
        onValueChange={(itemValue) => handleChange('activityLevel', itemValue)}
      >
        <Picker.Item label="None" value="none" />
        <Picker.Item label="A Bit" value="a bit" />
        <Picker.Item label="A Lot" value="a lot" />
        <Picker.Item label="Professional Level" value="professional level" />
      </Picker>

      <Text style={styles.label}>Objective</Text>
      <Picker
        selectedValue={profile.objective}
        onValueChange={(itemValue) => handleChange('objective', itemValue)}
      >
        <Picker.Item label="Gain Weight" value="gain weight" />
        <Picker.Item label="Lose Weight" value="lose weight" />
        <Picker.Item label="Gain Muscle Mass" value="gain muscle mass" />
        <Picker.Item label="Maintain Weight" value="maintain weight" />
      </Picker>

      <Text style={styles.label}>Diet</Text>
      <Picker
        selectedValue={profile.diet}
        onValueChange={(itemValue) => handleChange('diet', itemValue)}
      >
        <Picker.Item label="Vegan" value="vegan" />
        <Picker.Item label="Vegetarian" value="vegetarian" />
        <Picker.Item label="Non-Vegetarian" value="non-vegetarian" />
        <Picker.Item label="Paleo" value="paleo" />
        <Picker.Item label="Keto" value="keto" />
      </Picker>

      <View style={{ marginTop: 20 }}>
        <Button title="Update Profile" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { 
    flex: 1, 
    justifyContent: 'center' },
  label: { 
    fontWeight: 'bold', 
    marginTop: 15 },
  input: {
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 10,
    borderRadius: 6, 
    marginTop: 5,
  },
});
