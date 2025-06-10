import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "./axiosInstance";

import globalStyle from "./styles/global";
import profileStyle from "./styles/profileList";

export default function Home() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedToken = await AsyncStorage.getItem("accessToken");

        if (!storedUserId || !storedToken) {
          router.replace("/login");
          return;
        }

        const response = await axiosInstance.get(`profiles/get/profiles/${storedUserId}`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.status === 200) {
          setProfiles(response.data.profiles);
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
        Alert.alert("Error", "Failed to fetch profiles.");
        router.replace("/login");
      }
    };

    checkAuthAndFetch();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      Alert.alert("Logged out", "You have been logged out.");
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const handleProfileClick = async (profileId: number) => {
    try {
      await AsyncStorage.setItem("profileId", profileId.toString());
      console.log("Profile ID stored:", profileId);
      router.push("/tabs/profile");
    } catch (error) {
      console.error("Failed to store profile ID:", error);
      Alert.alert("Error", "Could not store profile ID. Please try again.");
    }
  };

  const handleCreateProfile = () => {
    router.push("/profileSignup");
  };

  return (
    <View style={globalStyle.body}>
      <Text style={globalStyle.mainTitle}>Vos profils</Text>
      <ScrollView contentContainerStyle={profileStyle.profilesList}>
        {profiles.map((profile) => (
          <TouchableOpacity
            key={profile.id}
            style={[profileStyle.profile]}
            onPress={() => handleProfileClick(profile.id)}
          >
            <Ionicons
              name="fast-food"
              style={[profileStyle.profileIcon, globalStyle.lightGreenText, globalStyle.peachShadow]}
            />
            <Text style={[profileStyle.profileName, globalStyle.darkGreenText]}>{profile.profileName}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[profileStyle.profile]} onPress={handleCreateProfile}>
          <Ionicons
            name="add"
            style={[profileStyle.profileIcon, globalStyle.darkGreenText, profileStyle.addProfileBtn]}
          />
          <Text style={[profileStyle.profileName, globalStyle.darkGreenText]}>Nouveau</Text>
        </TouchableOpacity>
      </ScrollView>
      <TouchableOpacity onPress={handleLogout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
