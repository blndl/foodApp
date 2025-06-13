import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect, Link } from 'expo-router';
import axiosInstance from './axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IngredientMealSearchFilter from './components/MISearch';
import axios from 'axios';

import Navbar from './components/navbar';
import globalStyle from './styles/global';
import homeStyle from './styles/home';

function groupMealsWithIngredients(flatMeals: any[]) {
  const mealsMap = new Map();

  flatMeals.forEach((row) => {
    if (!mealsMap.has(row.meal_id)) {
      mealsMap.set(row.meal_id, {
        id: row.meal_id,
        profileId: row.profileId,
        name: row.meal_name,
        ingredients: [],
      });
    }

    const meal = mealsMap.get(row.meal_id);

    meal.ingredients.push({
      id: row.ingredient_id,
      food_label: row.food_label,
      quantity: row.quantity,
      proteines_g: row.proteines_g,
      glucides_g: row.glucides_g,
      lipides_g: row.lipides_g,
      nrj_kj: row.nrj_kj,
      proteines_total: row.proteines_total,
      glucides_total: row.glucides_total,
      lipides_total: row.lipides_total,
      energy_total_kj: row.energy_total_kj,
    });
  });

  return Array.from(mealsMap.values());
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [calories, setCalories] = useState<number | null>(null);
  const [dri, setDri] = useState<any>(null);

  const [ingredients, setIngredients] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError(null);

    try {
      const storedProfileId = await AsyncStorage.getItem('profileId');
      if (!storedProfileId) {
        setProfile(null);
        setLoadingProfile(false);
        return;
      }

      const parsedProfileId = parseInt(storedProfileId);
      if (isNaN(parsedProfileId)) {
        setProfile(null);
        setLoadingProfile(false);
        return;
      }

      const response = await axiosInstance.get(`profiles/get/profile/${parsedProfileId}`);

      setProfile(response.data);
      calculateDRI(response.data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);

      if (err.response && err.response.status === 404) {
        setProfileError('Profile not found. Please select or create a profile.');
      } else {
        setProfileError('Failed to fetch profile data');
      }

      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const calculateDRI = (profileData: any) => {
    const { weight, activityLevel } = profileData;

    let multiplier = 30;
    if (activityLevel === 'a bit') multiplier = 25;
    else if (activityLevel === 'a lot') multiplier = 30;
    else if (activityLevel === 'professional level') multiplier = 35;

    const weightKg = parseFloat(weight);
    const estimatedCalories = weightKg * multiplier;

    setCalories(estimatedCalories);

    const proteinGrams = [estimatedCalories * 0.10 / 4, estimatedCalories * 0.30 / 4];
    const fatGrams = [estimatedCalories * 0.20 / 9, estimatedCalories * 0.35 / 9];
    const carbsGrams = [estimatedCalories * 0.45 / 4, estimatedCalories * 0.65 / 4];
    const waterLiters = estimatedCalories / 1000;
    const fiberGrams = (estimatedCalories / 1000) * 14;

    setDri({
      protein: proteinGrams.map((v) => v.toFixed(1)),
      fat: fatGrams.map((v) => v.toFixed(1)),
      carbs: carbsGrams.map((v) => v.toFixed(1)),
      water: waterLiters.toFixed(2),
      fiber: fiberGrams.toFixed(1),
    });
  };

  const fetchIngredientsAndMeals = useCallback(async () => {
    setLoadingSearch(true);
    setSearchError(null);
    try {
      const [ingredientsRes, mealsRes] = await Promise.all([
        axiosInstance.get('/ingredients/ingredients'),
        axiosInstance.get('/meals/listmeals'),
      ]);
      setIngredients(ingredientsRes.data);
      setMeals(groupMealsWithIngredients(mealsRes.data));
    } catch (err) {
      console.error('Error fetching ingredients/meals:', err);
      setSearchError('Failed to load ingredients and meals.');
    } finally {
      setLoadingSearch(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchIngredientsAndMeals();
    }, [fetchProfile, fetchIngredientsAndMeals])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('profileId');
      router.replace('/home');
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  if (loadingProfile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {profile && <Navbar />}

      {profile ? (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Hello, {profile.profileName || 'User'}</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <Text>Age: {profile.age}</Text>
          <Text>Gender: {profile.gender}</Text>
          <Text>Height: {profile.height}</Text>
          <Text>Weight: {profile.weight}</Text>
          <Text>Activity Level: {profile.activityLevel}</Text>
          <Text>Objective: {profile.objective}</Text>
          <Text>Diet: {profile.diet}</Text>

          <View style={{ marginTop: 30 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Recommended Daily Intake:</Text>
            {calories && <Text>Estimated Calories: {Math.round(calories)} kcal/day</Text>}
            {dri && (
              <>
                <Text>Protein: {dri.protein[0]} – {dri.protein[1]} g</Text>
                <Text>Fat: {dri.fat[0]} – {dri.fat[1]} g</Text>
                <Text>Carbohydrates: {dri.carbs[0]} – {dri.carbs[1]} g</Text>
                <Text>Water: {dri.water} L</Text>
                <Text>Fiber: {dri.fiber} g</Text>
              </>
            )}
          </View>
        </>
      ) : (
        <>
          <Text style={{ fontStyle: 'italic', marginBottom: 10 }}>
            Please log in and select a profile to see personalized info.
          </Text>
          <View style={homeStyle.authZone}>
            <Link href="/login" style={[globalStyle.link, homeStyle.authLink]}>
              Connexion
            </Link>
            <Link href="/signup" style={[globalStyle.link, homeStyle.authLink]}>
              Inscription
            </Link>
          </View>
        </>
      )}

      <View style={{ flex: 1, marginTop: 30 }}>
        <IngredientMealSearchFilter
          ingredients={ingredients}
          meals={meals}
          loading={loadingSearch}
          error={searchError}
          onRetry={fetchIngredientsAndMeals}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 10,
    backgroundColor: '#2e7d32',
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
