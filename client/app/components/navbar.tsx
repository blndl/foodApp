import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    { label: 'Profil', path: '/' },
    { label: 'Repas', path: '/meals' },
    { label: 'Paramètres', path: '/settings' },
  ];

  return (
    <View style={styles.navbar}>
      {links.map((link) => {
        const isActive = link.label === 'Repas'
          ? pathname.startsWith(link.path)
          : pathname === link.path;

        return (
          <TouchableOpacity key={link.path} onPress={() => router.push(link.path)}>
            <Text style={[styles.navLink, isActive && styles.activeLink]}>
              {link.label}
            </Text>
          </TouchableOpacity>
        );
      })}
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
  activeLink: {
    textDecorationLine: 'underline',
    color: '#1b5e20',
  },
});
