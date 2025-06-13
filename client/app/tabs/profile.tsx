import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import axiosInstance from '../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IngredientMealSearchFilter from '../components/MISearch';

function groupMealsWithIngredients(flatMeals) {
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

  // Profile states
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [calories, setCalories] = useState<number | null>(null);
  const [dri, setDri] = useState<any>(null);

  // Ingredients & Meals states
  const [ingredients, setIngredients] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError(null);
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

      const response = await axiosInstance.get(`profiles/get/profile/${parsedProfileId}`);
      if (response.status === 200) {
        setProfile(response.data);
        calculateDRI(response.data);
      } else {
        setProfileError('Profile not found');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      Alert.alert('Error', 'Failed to fetch profile data.');
      setProfileError('Failed to fetch profile data');
    } finally {
      setLoadingProfile(false);
    }
  }, [router]);

  // Calculate DRI from profile
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

  // Fetch ingredients and meals
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

  // Combined useFocusEffect to fetch profile and ingredients/meals on focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchIngredientsAndMeals();
    }, [fetchProfile, fetchIngredientsAndMeals])
  );

  // Logout handler
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('profileId');
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  // Show loading if profile loading
  if (loadingProfile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Show error if profile fetch failed
  if (profileError) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>{profileError}</Text>
        <TouchableOpacity onPress={() => router.replace('/home')}>
          <Text style={{ color: 'blue', marginTop: 10 }}>Go Back Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header and Logout */}
      <View style={styles.header}>
        <Text style={styles.title}>Hello, {profile?.profileName || 'User'}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Profile info */}
      <Text>Age: {profile?.age}</Text>
      <Text>Gender: {profile?.gender}</Text>
      <Text>Height: {profile?.height}</Text>
      <Text>Weight: {profile?.weight}</Text>
      <Text>Activity Level: {profile?.activityLevel}</Text>
      <Text>Objective: {profile?.objective}</Text>
      <Text>Diet: {profile?.diet}</Text>

      {/* DRI */}
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

      {/* Ingredient and Meal Search Filter */}
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
    backgroundColor: '#dc3545',
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
