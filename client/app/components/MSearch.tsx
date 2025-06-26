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

function MealSearch({ meals, loading, error, onRetry }) {
  const [filterText, setFilterText] = useState('');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filterMeals = () => {
    const query = filterText.toLowerCase();

    return meals.filter((meal) => {
      const nameMatch = meal.name?.toLowerCase().includes(query);
      const ingredientsMatch = meal.ingredients?.some(
        (ing) => ing.food_label?.toLowerCase().includes(query)
      );
      return nameMatch || ingredientsMatch;
    });
  };

  const filteredMeals = filterMeals();

  const handleMealPress = (meal) => {
    setSelectedMeal(meal);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemButton} onPress={() => handleMealPress(item)}>
      <Text style={styles.label}>
        {item.name} <Text style={styles.typeLabel}>(Meal)</Text>
      </Text>
    </TouchableOpacity>
  );

  const renderModalContent = () => {
    if (!selectedMeal) return null;

    return (
      <View>
        <Text style={styles.modalTitle}>{selectedMeal.name}</Text>
        <Text>Ingredients:</Text>
        {selectedMeal.ingredients?.map((ing) => (
          <Text key={ing.id} style={{ marginLeft: 10 }}>
            - {ing.food_label} ({ing.quantity}g)
          </Text>
        ))}
      </View>
    );
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
        placeholder="Search meals by name or ingredient..."
        value={filterText}
        onChangeText={setFilterText}
      />

      {filteredMeals.length > 0 ? (
        <FlatList
          data={filteredMeals}
          keyExtractor={(item) => `meal-${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <Text style={styles.noResult}>No matching meals found.</Text>
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

export default MealSearch;
