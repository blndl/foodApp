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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axiosInstance from '../../axiosInstance';
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
  const [selectedIngredient, setSelectedIngredient] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [mealName, setMealName] = useState<string>('');
  const [mealIngredients, setMealIngredients] = useState<MealIngredient[]>([]);

  useEffect(() => {
    axiosInstance
      .get('/ingredients/ingredients')
      .then((res) => setIngredientsList(res.data))
      .catch((err) => {
        console.error('Failed to load ingredients:', err);
        Alert.alert('Error', 'Could not load ingredients');
      });
  }, []);

  const addIngredient = () => {
    if (!selectedIngredient) {
      Alert.alert('Select ingredient', 'Please select an ingredient');
      return;
    }
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Alert.alert('Invalid quantity', 'Please enter a valid quantity');
      return;
    }

    const ingredientIdNum = Number(selectedIngredient);

    const ingredientName =
      ingredientsList.find((i) => i.id === ingredientIdNum)?.food_label || 'Unknown';

    setMealIngredients((prev) => [
      ...prev,
      { ingredientId: selectedIngredient, quantity: Number(quantity), name: ingredientName },
    ]);

    setSelectedIngredient('');
    setQuantity('');
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

      <Text style={styles.label}>Select Ingredient</Text>
      <Picker
        selectedValue={selectedIngredient}
        onValueChange={(itemValue) => setSelectedIngredient(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="-- Select Ingredient --" value="" />
        {ingredientsList.map((ingredient) => (
          <Picker.Item
            key={ingredient.id}
            label={ingredient.food_label}
            value={ingredient.id.toString()}
          />
        ))}
      </Picker>

      <Text style={styles.label}>Quantity</Text>
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
                {item.name} - {item.quantity}
              </Text>
              <TouchableOpacity
                onPress={() => deleteIngredient(index)}
                style={styles.deleteButton}
                activeOpacity={0.7}
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
  picker: {
    marginTop: 8,
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
