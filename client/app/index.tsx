import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import axiosInstance from './axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IngredientMealSearchFilter from './components/MISearch';
import Navbar from './components/navbar';
import globalStyle from './styles/global';
import homeStyle from './styles/home';

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

    mealsMap.get(row.meal_id).ingredients.push({
      id: row.ingredient_id,
      food_label: row.food_label,
      quantity: row.quantity,
      proteines_g: row.proteines_g,
      glucides_g: row.glucides_g,
      lipides_g: row.lipides_g,
      nrj_kj: row.nrj_kj,
      energy_total_kj: row.energy_total_kj,
    });
  });

  return Array.from(mealsMap.values());
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [calories, setCalories] = useState(null);
  const [dri, setDri] = useState(null);
  const [eatenCalories, setEatenCalories] = useState({
    kcal: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  const [ingredients, setIngredients] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(true);
  const [searchError, setSearchError] = useState(null);
  const [randomMeal, setRandomMeal] = useState(null);

  const calculateDRI = (profileData) => {
    if (!profileData) {
      setDri({
        kcal: 2000,
        protein: 50,
        carbs: 260,
        fats: 70,
      });
      return;
    }

    const { weight, activityLevel } = profileData;
    let multiplier = 30;
    if (activityLevel === 'a bit') multiplier = 25;
    else if (activityLevel === 'a lot') multiplier = 30;
    else if (activityLevel === 'professional level') multiplier = 35;

    const weightKg = parseFloat(weight);
    const estimatedKcal = Math.round(weightKg * multiplier);
    const estimatedProtein = Math.round(weightKg * 1.2);
    const estimatedCarbs = Math.round(weightKg * 4);
    const estimatedFats = Math.round(weightKg * 1);

    setCalories(estimatedKcal);
    setDri({
      kcal: estimatedKcal,
      protein: estimatedProtein,
      carbs: estimatedCarbs,
      fats: estimatedFats,
    });
  };

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const storedProfileId = await AsyncStorage.getItem('profileId');
      if (storedProfileId) {
        const parsedId = parseInt(storedProfileId);
        const response = await axiosInstance.get(`profiles/get/profile/${parsedId}`);
        const data = response.data;
        setProfile(data);
        calculateDRI(data);
      } else {
        calculateDRI(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfileError('Could not load profile.');
      setProfile(null);
      calculateDRI(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchEatenMealsToday = useCallback(async () => {
    if (!profile) return;

    try {
      const profileId = await AsyncStorage.getItem('profileId');
      if (!profileId) return;

      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;

      const { data } = await axiosInstance.get(`/diet/mealseaten/${profileId}/${day}/${month}`);

      let totalKcal = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFats = 0;

      data.forEach((meal) => {
        if (!meal.ingredients) return;

        meal.ingredients.forEach((ing) => {
          const qty = Number(ing.quantity) || 0;
          const factor = qty / 100;

          const kj = ing.energy_total_kj ?? ing.nrj_kj ?? 0;
          totalKcal += (kj * factor) / 4.184;

          totalProtein += (ing.proteines_g || 0) * factor;
          totalCarbs += (ing.glucides_g || 0) * factor;
          totalFats += (ing.lipides_g || 0) * factor;
        });
      });

      setEatenCalories({
        kcal: Math.round(totalKcal),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fats: Math.round(totalFats),
      });
    } catch (err) {
      console.error('Failed to fetch eaten meals:', err);
    }
  }, [profile]);

  const fetchIngredientsAndMeals = useCallback(async () => {
    setLoadingSearch(true);
    setSearchError(null);
    try {
      const [ingRes, mealRes] = await Promise.all([
        axiosInstance.get('/ingredients/ingredients'),
        axiosInstance.get('/meals/listmeals'),
      ]);
      setIngredients(ingRes.data);
      setMeals(groupMealsWithIngredients(mealRes.data));

      if (eatenCalories.kcal < calories) {
        const randomMealIndex = Math.floor(Math.random() * mealRes.data.length);
        setRandomMeal(mealRes.data[randomMealIndex]);
        console.log('Random meal selected:', mealRes.data[randomMealIndex]);  // Log random meal
      } else {
        setRandomMeal(null);
        console.log('No suggestion needed, eaten calories >= recommended kcal');
      }
    } catch (err) {
      console.error('Error fetching ingredients/meals:', err);
      setSearchError('Failed to load ingredients and meals.');
    } finally {
      setLoadingSearch(false);
    }
  }, [eatenCalories, calories]);

  useEffect(() => {
    fetchProfile();
    fetchIngredientsAndMeals();
  }, []); 

  useEffect(() => {
    if (profile) {
      fetchEatenMealsToday();
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      calculateDRI(profile);
    }
  }, [eatenCalories, profile]);

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
          <Text>Weight: {profile.weight} kg</Text>
          <Text>Activity Level: {profile.activityLevel}</Text>
          <Text>Objective: {profile.objective}</Text>
          <Text>Diet: {profile.diet}</Text>

          {dri && (
            <View style={{ marginTop: 30 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Daily Intake Summary</Text>
              <Text style={{ marginTop: 8 }}>
                Calories: {eatenCalories.kcal} kcal / {dri.kcal} kcal
              </Text>
              <Text>Protein: {eatenCalories.protein} g / {dri.protein} g</Text>
              <Text>Carbs: {eatenCalories.carbs} g / {dri.carbs} g</Text>
              <Text>Fats: {eatenCalories.fats} g / {dri.fats} g</Text>
            </View>
          )}

          {eatenCalories.kcal < dri.kcal && randomMeal && (
            <View style={styles.suggestionContainer}>
              <Text style={styles.suggestionTitle}>Suggested Meal</Text>
              <Text style={styles.suggestionText}>{randomMeal?.meal_name}</Text>
              {randomMeal?.ingredients && randomMeal.ingredients.map((ingredient, idx) => (
                <View key={idx} style={styles.ingredient}>
                  <Text>{ingredient.food_label}: {ingredient.quantity}g</Text>
                  <Text>Protein: {ingredient.proteines_g}g</Text>
                  <Text>Carbs: {ingredient.glucides_g}g</Text>
                  <Text>Fats: {ingredient.lipides_g}g</Text>
                  <Text>Energy: {ingredient.energy_total_kj} kJ</Text>
                </View>
              ))}
            </View>
          )}
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
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  logoutButton: {
    padding: 10,
    backgroundColor: '#2e7d32',
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  suggestionContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 5,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  suggestionText: {
    fontSize: 16,
    marginBottom: 5,
  },
  ingredient: {
    marginBottom: 10,
  },
});
