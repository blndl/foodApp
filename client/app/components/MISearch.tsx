import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';

function IngredientMealSearchFilter({ ingredients, meals, loading, error, onRetry }) {
  const [filterText, setFilterText] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => {
    const label = item.type === 'ingredient' ? item.food_label : item.name;
    const type = item.type === 'ingredient' ? 'Ingredient' : 'Meal';

    return (
      <TouchableOpacity style={styles.itemButton} onPress={() => handleItemPress(item)}>
        <Text style={styles.label}>
          {label} <Text style={styles.typeLabel}>({type})</Text>
        </Text>
      </TouchableOpacity>
    );
  };

  const renderModalContent = () => {
    if (!selectedItem) return null;

    if (selectedItem.type === 'ingredient') {
      return (
        <View>
          <Text style={styles.modalTitle}>{selectedItem.food_label} (Ingredient)</Text>
          <Text>Proteins/g: {selectedItem.proteines_g}g</Text>
          <Text>Carbs/g: {selectedItem.glucides_g}g</Text>
          <Text>Fats/g: {selectedItem.lipides_g}g</Text>
          <Text>Fibers/g: {selectedItem.fibers_g}g</Text>
          <Text>Energy/kj: {selectedItem.nrj_kj}kj</Text>
        </View>
      );
    } else if (selectedItem.type === 'meal') {
      return (
        <View>
          <Text style={styles.modalTitle}>{selectedItem.name} (Meal)</Text>
          <Text>Ingredients:</Text>
          {selectedItem.ingredients.map((ing) => (
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
            item.type === 'ingredient' ? `ingredient-${item.id}` : `meal-${item.id}`
          }
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <Text style={styles.noResult}>No matching ingredients or meals.</Text>
      )}

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>{renderModalContent()}</ScrollView>
            <Pressable onPress={() => setModalVisible(false)} style={styles.modalClose}>
              <Text style={{ color: 'white' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    marginHorizontal: 10,
  },
  itemButton: {
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
    textAlign: 'center',
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalClose: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default IngredientMealSearchFilter;
