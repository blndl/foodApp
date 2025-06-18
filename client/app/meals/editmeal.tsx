import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Button,
  Alert,
  ScrollView,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { MealsStackParamList } from './_layout';
import axiosInstance from '../axiosInstance';

type EditMealScreenRouteProp = RouteProp<MealsStackParamList, 'EditMeal'>;

interface Props {
  route: EditMealScreenRouteProp;
}

interface Ingredient {
  ingredient_id: number;
  food_label: string;
  quantity: number;
}

interface MealDetail {
  id: number;
  name: string;
  profileName: string;
  ingredients: Ingredient[];
  calories: number;
  total_proteines: number;
  total_glucides: number;
  total_lipides: number;
  total_energy_kj: number;
}

const EditMealScreen: React.FC<Props> = ({ route }) => {
  const { mealId } = route.params;
  const navigation = useNavigation();

  const [meal, setMeal] = useState<MealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/showmealby/${mealId}`);
        setMeal(res.data);
        setName(res.data.name);
      } catch (error) {
        Alert.alert('Error', 'Failed to load meal details.');
      } finally {
        setLoading(false);
      }
    };

    fetchMeal();
  }, [mealId]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Meal name cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      await axiosInstance.put(`/meals/editmeal/${mealId}`, { name });
      Alert.alert('Success', 'Meal updated successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save meal.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={styles.center}>
        <Text>Meal not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Meal Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter meal name"
        editable={!saving}
      />

      <Text style={styles.label}>Calories: {meal.calories}</Text>

      <Text style={styles.label}>Ingredients:</Text>
      {meal.ingredients.map((ing) => (
        <View key={ing.ingredient_id} style={styles.ingredientRow}>
          <Text>
            {ing.food_label} - Quantity: {ing.quantity}
          </Text>
        </View>
      ))}

      <View style={{ marginTop: 20 }}>
        <Button
          title={saving ? 'Saving...' : 'Save'}
          onPress={handleSave}
          disabled={saving}
          color="#28a745"
        />
      </View>
    </ScrollView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  ingredientRow: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
});

export default EditMealScreen;
