import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Picker,
} from 'react-native';
import axiosInstance from '../../axiosInstance';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';

import { MealsStackParamList } from './_layout'; // your meals stack types
import { TabsParamList } from '../_layout'; // your tabs types

// Compose the navigation prop for nested navigation
type MealsStackNavProp = NativeStackNavigationProp<MealsStackParamList, 'MealsList'>;
type TabNavProp = BottomTabNavigationProp<TabsParamList, 'Meals'>;
type NavigationProp = CompositeNavigationProp<TabNavProp, MealsStackNavProp>;

interface Ingredient {
  ingredient_id: number;
  food_label: string;
  quantity: number;
  per_unit: {
    proteines_g: number;
    glucides_g: number;
    lipides_g: number;
    nrj_kj: number;
  };
  total: {
    proteines_total: number;
    glucides_total: number;
    lipides_total: number;
    energy_total_kj: number;
  };
}

interface Meal {
  meal_id: number;
  name: string;
  profileName: string;
  ingredients: Ingredient[];
  calories: number;
  total_proteines: number;
  total_glucides: number;
  total_lipides: number;
  total_energy_kj: number;
}

const MealsListScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [filterIngredient, setFilterIngredient] = useState('');

  useEffect(() => {
    fetchMeals();
    fetchIngredients();
  }, []);

  useEffect(() => {
    applyFilterAndSort();
  }, [meals, sortAsc, filterIngredient]);

  const groupMeals = (rows: any[]): Meal[] => {
    const mealsMap: { [id: number]: Meal } = {};

    rows.forEach(row => {
      if (!mealsMap[row.meal_id]) {
        mealsMap[row.meal_id] = {
          meal_id: row.meal_id,
          name: row.meal_name,
          profileName: row.profileName,
          calories: 0,
          total_proteines: 0,
          total_glucides: 0,
          total_lipides: 0,
          total_energy_kj: 0,
          ingredients: [],
        };
      }

      mealsMap[row.meal_id].ingredients.push({
        ingredient_id: row.ingredient_id,
        food_label: row.food_label,
        quantity: row.quantity,
        per_unit: {
          proteines_g: row.proteines_g,
          glucides_g: row.glucides_g,
          lipides_g: row.lipides_g,
          nrj_kj: row.nrj_kj,
        },
        total: {
          proteines_total: row.proteines_total,
          glucides_total: row.glucides_total,
          lipides_total: row.lipides_total,
          energy_total_kj: row.energy_total_kj,
        },
      });

      mealsMap[row.meal_id].total_proteines += Number(row.proteines_total);
      mealsMap[row.meal_id].total_glucides += Number(row.glucides_total);
      mealsMap[row.meal_id].total_lipides += Number(row.lipides_total);
      mealsMap[row.meal_id].total_energy_kj += Number(row.energy_total_kj);
    });

    Object.values(mealsMap).forEach(meal => {
      meal.total_proteines = Number(meal.total_proteines.toFixed(2));
      meal.total_glucides = Number(meal.total_glucides.toFixed(2));
      meal.total_lipides = Number(meal.total_lipides.toFixed(2));
      meal.total_energy_kj = Number(meal.total_energy_kj.toFixed(2));
    });

    return Object.values(mealsMap);
  };

  const fetchMeals = async () => {
    try {
      const res = await axiosInstance.get('/meals/listmeals');
      const groupedMeals = groupMeals(res.data);
      setMeals(groupedMeals);
    } catch (err) {
      console.error('Failed to fetch meals:', err);
    }
  };

  const fetchIngredients = async () => {
    try {
      const res = await axiosInstance.get('/ingredients/ingredients');
      const ingredientNames = res.data.map((ing: any) => ing.food_label);
      setIngredients(ingredientNames);
    } catch (err) {
      console.error('Failed to fetch ingredients:', err);
    }
  };

  const applyFilterAndSort = () => {
    let data = [...meals];

    if (filterIngredient) {
      data = data.filter(meal =>
        meal.ingredients.some(ing => ing.food_label === filterIngredient)
      );
    }

    data.sort((a, b) =>
      sortAsc
        ? a.total_energy_kj - b.total_energy_kj
        : b.total_energy_kj - a.total_energy_kj
    );

    setFilteredMeals(data);
  };

  const toggleSort = () => setSortAsc(prev => !prev);

  const formatNumber = (val: any, decimals = 2) => {
    const num = Number(val);
    if (isNaN(num)) return decimals === 0 ? '0' : '0.00';
    return num.toFixed(decimals);
  };

  const renderMeal = ({ item }: { item: Meal }) => (
    <View style={styles.card}>
      <Text style={styles.mealName}>{item.name}</Text>
      <Text style={styles.details}>By: {item.profileName}</Text>

      <Text style={[styles.details, { marginTop: 8, fontWeight: '600' }]}>
        Ingredients:
      </Text>
      {item.ingredients.map(ing => (
        <View key={ing.ingredient_id} style={styles.ingredientRow}>
          <Text style={styles.ingredientName}>
            {ing.food_label} (x{ing.quantity})
          </Text>
          <Text style={styles.ingredientStats}>
            Proteins: {formatNumber(ing.total.proteines_total)}g | Glucides:{' '}
            {formatNumber(ing.total.glucides_total)}g | Lipides:{' '}
            {formatNumber(ing.total.lipides_total)}g | Energy:{' '}
            {formatNumber(ing.total.energy_total_kj / 4.184, 0)} kcal
          </Text>
        </View>
      ))}

      <View style={styles.totalNutrition}>
        <Text style={styles.totalNutritionText}>
          Total Proteins: {formatNumber(item.total_proteines)}g | Total Glucides:{' '}
          {formatNumber(item.total_glucides)}g | Total Lipides:{' '}
          {formatNumber(item.total_lipides)}g | Total Energy:{' '}
          {formatNumber(item.total_energy_kj / 4.184, 0)} kcal
        </Text>
      </View>

      <Text style={styles.details}>
        Calories: {formatNumber(item.total_energy_kj / 4.184, 0)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
      <TouchableOpacity
        style={[styles.halfButton, { backgroundColor: '#17a2b8' }]}
        onPress={() => navigation.navigate('MyMeals')}
        >
        <Text style={styles.createButtonText}>My Meals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.halfButton, { backgroundColor: '#28a745' }]}
          onPress={() => navigation.navigate('CreateMeal')}
        >
          <Text style={styles.createButtonText}>+ Create Meal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterSortContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleSort}>
          <Text style={styles.buttonText}>
            Sort by Calories {sortAsc ? '(Asc)' : '(Desc)'}
          </Text>
        </TouchableOpacity>

        <Picker
          selectedValue={filterIngredient}
          onValueChange={(val) => setFilterIngredient(val)}
          style={styles.picker}
        >
          <Picker.Item label="Filter by Ingredient" value="" />
          {ingredients.map((ing) => (
            <Picker.Item key={ing} label={ing} value={ing} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item.meal_id.toString()}
        renderItem={renderMeal}
        ListEmptyComponent={<Text>No meals available</Text>}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfButton: {
    flex: 0.48,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  filterSortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  picker: {
    flex: 1,
    marginLeft: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  details: {
    fontSize: 14,
    color: '#555',
  },
  ingredientRow: {
    marginVertical: 4,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: '600',
  },
  ingredientStats: {
    fontSize: 12,
    color: '#333',
  },
  totalNutrition: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 6,
  },
  totalNutritionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MealsListScreen;
