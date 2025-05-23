import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axiosInstance from '../axiosInstance';


export default function Settings() {
  const { profileId } = useLocalSearchParams();
  const router = useRouter();

  const handleModifyProfile = () => {
    router.push({
      pathname: '../profileModify',
      params: { profileId }
    });
  };
/*
  const handleDeleteProfile = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete your profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
            onPress: async () => {
                try {
                  await axiosInstance.delete(`/profiles/${profileId}`);
                  console.log('Profile deleted');
                  router.push('/home');
                } catch (error) {
                  console.error('Failed to delete profile:', error);
                  Alert.alert('Error', 'Failed to delete profile. Please try again.');
                }
            }
        }},
      ],
      { cancelable: true }
    );
  };*/
  const handleDeleteProfile = async () => {
    try {
      await axiosInstance.delete(`/delete/profile/${profileId}`);
      console.log('Profile deleted');
      router.push('/home');
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };

  return (
    <View style={styles.container}>
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