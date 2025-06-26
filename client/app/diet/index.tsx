import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from '../components/navbar';
import axiosInstance from '../axiosInstance';
import { useRouter } from 'expo-router';

export default function DietPage() {
  const [meals, setMeals] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/meals/listmeals');
      const groupedMeals = groupMealsWithIngredients(res.data);
      setMeals(groupedMeals);
      setFilteredMeals(groupedMeals);
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError('Failed to load meals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const groupMealsWithIngredients = (flatMeals) => {
    const map = new Map();
    flatMeals.forEach((r) => {
      if (!map.has(r.meal_id)) {
        map.set(r.meal_id, {
          id: r.meal_id,
          name: r.meal_name,
          ingredients: [],
        });
      }
      map.get(r.meal_id).ingredients.push({
        id: r.ingredient_id,
        food_label: r.food_label,
        quantity: r.quantity,
        proteines_g: r.proteines_g,
        glucides_g: r.glucides_g,
        lipides_g: r.lipides_g,
        nrj_kj: r.nrj_kj,
      });
    });
    return Array.from(map.values());
  };

  useEffect(() => {
    if (!searchQuery.trim()) return setFilteredMeals(meals);
    const q = searchQuery.toLowerCase();
    setFilteredMeals(
      meals.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.ingredients.some((i) => i.food_label.toLowerCase().includes(q))
      )
    );
  }, [searchQuery, meals]);

  const handleEat = async (meal) => {
    try {
      const profileId = await AsyncStorage.getItem('profileId');
      if (!profileId) {
        Alert.alert('Error', 'Profile ID not found.');
        return;
      }

      await axiosInstance.post('/diet/eatmeal', {
        profileId,
        mealId: meal.id,
      });

      Alert.alert('Bon appétit!', `${meal.name} logged as eaten.`);
      setModalVisible(false);
    } catch (error) {
      console.error('Error logging meal:', error);
      Alert.alert('Error', 'Failed to log meal as eaten.');
    }
  };

  const renderMeal = ({ item }) => (
    <TouchableOpacity
      style={styles.mealItem}
      onPress={() => {
        setSelectedMeal(item);
        setModalVisible(true);
      }}
    >
      <Text style={styles.mealName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderModalContent = () => {
    if (!selectedMeal) return null;

    let kcal = 0,
      prot = 0,
      carb = 0,
      fat = 0;

    selectedMeal.ingredients.forEach((i) => {
      const qty = Number(i.quantity) || 0;
      const factor = qty / 100;

      kcal += ((i.nrj_kj || 0) * factor) / 4.184;
      prot += (i.proteines_g || 0) * factor;
      carb += (i.glucides_g || 0) * factor;
      fat += (i.lipides_g || 0) * factor;
    });

    return (
      <View>
        <Text style={styles.modalTitle}>{selectedMeal.name}</Text>

        <Text style={styles.section}>Ingredients:</Text>
        {selectedMeal.ingredients.map((i) => (
          <Text key={i.id} style={styles.modalText}>
            - {i.food_label} ({i.quantity}g)
          </Text>
        ))}

        <Text style={styles.section}>Nutrition Totals:</Text>
        <Text style={styles.modalText}>Calories: {kcal.toFixed(1)} kcal</Text>
        <Text style={styles.modalText}>Proteins: {prot.toFixed(1)} g</Text>
        <Text style={styles.modalText}>Carbs: {carb.toFixed(1)} g</Text>
        <Text style={styles.modalText}>Fats: {fat.toFixed(1)} g</Text>

        <TouchableOpacity
          style={styles.eatButton}
          onPress={() => handleEat(selectedMeal)}
        >
          <Text style={styles.eatButtonText}>Eat</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Régime</Text>

      <TouchableOpacity
        style={styles.myDietButton}
        onPress={() => router.push('/MyDietPage')}
      >
        <Text style={styles.myDietButtonText}>My Diet</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by meal or ingredient"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: 'red' }}>{error}</Text>
          <TouchableOpacity onPress={fetchMeals}>
            <Text style={{ color: 'blue', marginTop: 10 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredMeals.length === 0 ? (
        <View style={styles.center}>
          <Text>No meals found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMeals}
          keyExtractor={(m) => `meal-${m.id}`}
          renderItem={renderMeal}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>{renderModalContent()}</ScrollView>
            <Pressable
              onPress={() => setModalVisible(false)}
              style={styles.modalClose}
            >
              <Text style={{ color: 'white' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  myDietButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  myDietButtonText: { color: 'white', fontWeight: 'bold' },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  mealItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  mealName: { fontSize: 16, fontWeight: '600' },
  section: { fontWeight: '600', marginTop: 15 },
  modalText: { marginLeft: 10, marginVertical: 2 },
  eatButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
  eatButtonText: { color: 'white', fontWeight: 'bold' },
  center: { alignItems: 'center', marginTop: 20 },
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
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalClose: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
