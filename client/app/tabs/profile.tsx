import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axiosInstance from './../axiosInstance';

export default function ProfilePage() {
  const { profileId } = useLocalSearchParams();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        setError('Profile ID is missing');
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/get/profile/${profileId}`);
        setProfile(response.data);
      } catch (err) {
        setError('Failed to fetch profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  const handleLogout = async () => {
    try {
      router.replace('..');
    } catch (error) {
      console.error('Logout failed:', error);
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hello {profile?.profileName}</Text>
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
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  logoutButton: {
    padding: 10, backgroundColor: '#dc3545', borderRadius: 5,
  },
  logoutText: { color: '#fff', fontWeight: 'bold' },
});