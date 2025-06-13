import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

function IngredientMealSearchFilter({ ingredients, meals, loading, error, onRetry }) {
  const [filterText, setFilterText] = useState('');

  const filterItems = () => {
    const query = filterText.toLowerCase();

    const filteredIngredients = ingredients
      .filter(
        (item) =>
          item &&
          typeof item.food_label === 'string' &&
          item.food_label.toLowerCase().includes(query)
      )
      .map((item) => ({ ...item, type: 'ingredient' }));

    const filteredMeals = meals
      .filter((meal) => {
        if (!meal || typeof meal !== 'object') return false;

        const mealName = typeof meal.name === 'string' ? meal.name : '';
        if (!mealName) return false;

        const mealNameMatch = mealName.toLowerCase().includes(query);

        const ingredientsMatch =
          Array.isArray(meal.ingredients) &&
          meal.ingredients.some(
            (ing) =>
              ing &&
              typeof ing.food_label === 'string' &&
              ing.food_label.toLowerCase().includes(query)
          );

        return mealNameMatch || ingredientsMatch;
      })
      .map((meal) => ({ ...meal, type: 'meal' }));

    return [...filteredIngredients, ...filteredMeals];
  };

  const combinedFilteredItems = filterItems();

  const renderItem = ({ item }) => {
    if (item.type === 'ingredient') {
      return (
        <View style={styles.item}>
          <Text style={styles.label}>
            {item.food_label} <Text style={styles.typeLabel}>(Ingredient)</Text>
          </Text>
          <Text>Proteins/g: {item.proteines_g}g</Text>
          <Text>Carbs/g: {item.glucides_g}g</Text>
          <Text>Fats/g: {item.lipides_g}g</Text>
          <Text>Fibers/g: {item.fibers_g}g</Text>
          <Text>Energy/kj: {item.nrj_kj}kj</Text>
        </View>
      );
    } else if (item.type === 'meal') {
      return (
        <View style={styles.item}>
          <Text style={styles.label}>
            {item.name} <Text style={styles.typeLabel}>(Meal)</Text>
          </Text>
          <Text>Ingredients:</Text>
          {item.ingredients.map((ing) => (
            <Text key={ing.id} style={{ marginLeft: 10 }}>
              - {ing.food_label} ({ing.quantity}g)
            </Text>
          ))}
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>{error}</Text>
        <TouchableOpacity onPress={onRetry}>
          <Text style={{ color: 'blue', marginTop: 10 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        style={styles.input}
        placeholder="Type to filter by name or ingredient..."
        value={filterText}
        onChangeText={setFilterText}
      />

      {combinedFilteredItems.length > 0 ? (
        <FlatList
          data={combinedFilteredItems}
          keyExtractor={(item) =>
            item.type === 'ingredient'
              ? `ingredient-${item.id}`
              : `meal-${item.id}`
          }
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <Text style={styles.noResult}>No matching ingredients or meals.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  item: {
    padding: 15,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResult: {
    color: '#888',
    fontStyle: 'italic',
    marginTop: 20,
  },
});

export default IngredientMealSearchFilter;
