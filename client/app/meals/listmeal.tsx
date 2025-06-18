import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import axiosInstance from '../axiosInstance';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { MealsStackParamList } from './_layout';
import Navbar from '../components/navbar';

type MealsStackNavProp = NativeStackNavigationProp<MealsStackParamList, 'MealsList'>;

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
  const navigation = useNavigation<MealsStackNavProp>();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [filterIngredient, setFilterIngredient] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  useEffect(() => {
    fetchMeals();
    fetchIngredients();
  }, []);

  useEffect(() => {
    applyFilterAndSort();
  }, [meals, sortAsc, filterIngredient]);

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

    return Object.values(mealsMap).map(meal => ({
      ...meal,
      total_proteines: Number(meal.total_proteines.toFixed(2)),
      total_glucides: Number(meal.total_glucides.toFixed(2)),
      total_lipides: Number(meal.total_lipides.toFixed(2)),
      total_energy_kj: Number(meal.total_energy_kj.toFixed(2)),
    }));
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

  const openMealModal = (meal: Meal) => {
    setSelectedMeal(meal);
    setModalVisible(true);
  };

  const closeMealModal = () => {
    setSelectedMeal(null);
    setModalVisible(false);
  };

  const goToEditMeal = (mealId: number) => {
    navigation.navigate('EditMeal', { mealId });
  };

  const deleteMeal = async (meal_id: number) => {
    try {
      await axiosInstance.delete(`/meals/${meal_id}`);
      setMeals(prevMeals => prevMeals.filter(meal => meal.meal_id !== meal_id));
    } catch (err) {
      console.error('Failed to delete meal:', err);
    }
  };

  const renderMeal = ({ item }: { item: Meal }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.mealButton}
        onPress={() => openMealModal(item)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.mealName}>{item.name}</Text>
          <Text style={styles.details}>By: {item.profileName}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteMeal(item.meal_id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => goToEditMeal(item.meal_id)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderModalContent = () => {
    if (!selectedMeal) return null;

    return (
      <View>
        <Text style={styles.modalTitle}>{selectedMeal.name}</Text>
        <Text style={{ marginBottom: 8, fontStyle: 'italic' }}>By: {selectedMeal.profileName}</Text>
        <Text>Calories: {selectedMeal.calories}</Text>
        <Text>Proteins: {selectedMeal.total_proteines}g</Text>
        <Text>Carbs: {selectedMeal.total_glucides}g</Text>
        <Text>Fats: {selectedMeal.total_lipides}g</Text>
        <Text>Energy (kJ): {selectedMeal.total_energy_kj}</Text>

        <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Ingredients:</Text>
        {selectedMeal.ingredients.map((ing) => (
          <Text key={ing.ingredient_id} style={{ marginLeft: 10 }}>
            - {ing.food_label} ({ing.quantity}g)
          </Text>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNavbar}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: '#6f42c1' }]}
          onPress={() => navigation.navigate('MealsList')}
        >
          <Text style={styles.navButtonText}>All Meals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: '#28a745' }]}
          onPress={() => navigation.navigate('CreateMeal')}
        >
          <Text style={styles.navButtonText}>+ Create Meal</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item.meal_id.toString()}
        renderItem={renderMeal}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <Navbar />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeMealModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>{renderModalContent()}</ScrollView>
            <Pressable onPress={closeMealModal} style={styles.modalClose}>
              <Text style={{ color: 'white' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  navButton: {
    flex: 0.48,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fafafa',
  },
  mealButton: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 14,
    color: '#555',
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalClose: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default MealsListScreen;
