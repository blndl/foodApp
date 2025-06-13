import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Navbar() {
  const router = useRouter();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => router.push('/tabs/profile')}>
        <Text style={styles.navLink}>Profil</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/tabs/meals')}>
        <Text style={styles.navLink}>Repas</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/tabs/settings')}>
        <Text style={styles.navLink}>Paramètres</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#e0f5e9',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  navLink: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
});
