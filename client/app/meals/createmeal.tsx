import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import axiosInstance from '../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Ingredient {
  id: number;
  food_label: string;
}

interface MealIngredient {
  ingredientId: string;
  quantity: number;
  name: string;
}

const CreateMealScreen: React.FC = () => {
  const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [mealName, setMealName] = useState<string>('');
  const [mealIngredients, setMealIngredients] = useState<MealIngredient[]>([]);

  useEffect(() => {
    axiosInstance
      .get('/ingredients/ingredients')
      .then((res) => {
        setIngredientsList(res.data);
        setFilteredIngredients(res.data);
      })
      .catch((err) => {
        console.error('Failed to load ingredients:', err);
        Alert.alert('Error', 'Could not load ingredients');
      });
  }, []);

  useEffect(() => {
    const filtered = ingredientsList.filter((ingredient) =>
      ingredient.food_label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIngredients(filtered);
  }, [searchTerm, ingredientsList]);

  const addIngredient = () => {
    if (!selectedIngredient) {
      Alert.alert('Select ingredient', 'Please select an ingredient');
      return;
    }
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Alert.alert('Invalid quantity', 'Please enter a valid quantity');
      return;
    }

    setMealIngredients((prev) => [
      ...prev,
      {
        ingredientId: selectedIngredient.id.toString(),
        quantity: Number(quantity),
        name: selectedIngredient.food_label,
      },
    ]);

    setSelectedIngredient(null);
    setSearchTerm('');
    setQuantity('');
    Keyboard.dismiss();
  };

  const deleteIngredient = (index: number) => {
    setMealIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const submitMeal = async () => {
    if (!mealName.trim()) {
      Alert.alert('Missing meal name', 'Please enter a meal name');
      return;
    }
    if (mealIngredients.length === 0) {
      Alert.alert('No ingredients', 'Add at least one ingredient');
      return;
    }

    try {
      const profileId = await AsyncStorage.getItem('profileId');

      if (!profileId) {
        Alert.alert('Error', 'User profile ID not found. Please log in again.');
        return;
      }

      await axiosInstance.post('/meals/meals', {
        name: mealName,
        profileId,
        ingredients: mealIngredients.map(({ ingredientId, quantity }) => ({
          ingredientId,
          quantity,
        })),
      });

      Alert.alert('Success', 'Meal created successfully');
      setMealName('');
      setMealIngredients([]);
    } catch (err) {
      console.error('Error creating meal:', err);
      Alert.alert('Error', 'Failed to create meal');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Meal Name</Text>
      <TextInput
        style={styles.input}
        value={mealName}
        onChangeText={setMealName}
        placeholder="Enter meal name"
      />

      <Text style={styles.label}>Search Ingredient</Text>
      <TextInput
        style={styles.input}
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Type to search ingredients"
      />

      {searchTerm.length > 0 && !selectedIngredient && (
        <FlatList
          data={filteredIngredients}
          keyExtractor={(item) => item.id.toString()}
          style={styles.dropdown}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedIngredient(item);
                setSearchTerm(item.food_label);
                Keyboard.dismiss();
              }}
            >
              <Text>{item.food_label}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Text style={styles.label}>Quantity (in grams)</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Enter quantity"
        keyboardType="numeric"
      />

      <Button title="Add Ingredient" onPress={addIngredient} />

      <Text style={[styles.label, { marginTop: 20 }]}>Added Ingredients:</Text>

      {mealIngredients.length === 0 ? (
        <Text>No ingredients added yet.</Text>
      ) : (
        <FlatList
          data={mealIngredients}
          keyExtractor={(item, index) => item.ingredientId + index}
          renderItem={({ item, index }) => (
            <View style={styles.ingredientRow}>
              <Text style={styles.ingredientText}>
                {item.name} - {item.quantity}g
              </Text>
              <TouchableOpacity
                onPress={() => deleteIngredient(index)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={{ marginTop: 30 }}>
        <Button title="Create Meal" onPress={submitMeal} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  label: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginTop: 8,
  },
  dropdown: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 4,
    borderRadius: 5,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ingredientText: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CreateMealScreen;
