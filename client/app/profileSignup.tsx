import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, Alert, Picker } from 'react-native';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import axiosInstance from './axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileSignup() {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      const userId = await AsyncStorage.getItem('userId');

      if (!userId) {
        Alert.alert('Error', 'User not logged in');
        router.replace("/login")
        return;
      }
      console.log("avant")

      const response = await axiosInstance.post('/profiles/newProfile', {
        ...data,
        userId: parseInt(userId),
      });
      console.log("pres")
      if (response.status === 201) {
        //Alert.alert('Profile Created', 'Your profile was successfully created', [
          //{ text: 'OK', onPress: () => router.push('/home') },
        //]);
        router.push('/home')
      }
    } catch (error: any) {
      console.error('Error creating profile:', error.message);
      Alert.alert('Profile Creation Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text>Profile Name</Text>
        <Controller
          control={control}
          name="profileName"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} onChangeText={onChange} value={value || ''} />
          )}
        />
        {errors.profileName && <Text style={styles.errorText}>Required</Text>}

        <Text>Age</Text>
        <Controller
          control={control}
          name="age"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} onChangeText={text => onChange(Number(text))} value={value?.toString() || ''} keyboardType="numeric" />
          )}
        />
        {errors.age && <Text style={styles.errorText}>Required</Text>}

        <Text>Gender</Text>
        <Controller
          control={control}
          name="gender"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} onChangeText={onChange} value={value || ''} />
          )}
        />
        {errors.gender && <Text style={styles.errorText}>Required</Text>}

        <Text>Height (cm)</Text>
        <Controller
          control={control}
          name="height"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} onChangeText={text => onChange(Number(text))} value={value?.toString() || ''} keyboardType="decimal-pad" />
          )}
        />
        {errors.height && <Text style={styles.errorText}>Required</Text>}

        <Text>Weight (kg)</Text>
        <Controller
          control={control}
          name="weight"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} onChangeText={text => onChange(Number(text))} value={value?.toString() || ''} keyboardType="decimal-pad" />
          )}
        />
        {errors.weight && <Text style={styles.errorText}>Required</Text>}

        <Text>Activity Level</Text>
        <Controller
          control={control}
          name="activityLevel"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <Picker selectedValue={value} onValueChange={onChange} style={styles.input}>
              <Picker.Item label="None" value="none" />
              <Picker.Item label="A bit" value="a bit" />
              <Picker.Item label="A lot" value="a lot" />
              <Picker.Item label="Professional level" value="professional level" />
            </Picker>
          )}
        />
        {errors.activityLevel && <Text style={styles.errorText}>Required</Text>}

        <Text>Objective</Text>
        <Controller
          control={control}
          name="objective"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <Picker selectedValue={value} onValueChange={onChange} style={styles.input}>
              <Picker.Item label="Gain Weight" value="gain weight" />
              <Picker.Item label="Lose Weight" value="lose weight" />
              <Picker.Item label="Gain Muscle Mass" value="gain muscle mass" />
              <Picker.Item label="Maintain Weight" value="maintain weight" />
            </Picker>
          )}
        />
        {errors.objective && <Text style={styles.errorText}>Required</Text>}

        <Text>Diet</Text>
        <Controller
          control={control}
          name="diet"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <Picker selectedValue={value} onValueChange={onChange} style={styles.input}>
              <Picker.Item label="Vegan" value="vegan" />
              <Picker.Item label="Vegetarian" value="vegetarian" />
              <Picker.Item label="Non-Vegetarian" value="non-vegetarian" />
              <Picker.Item label="Paleo" value="paleo" />
              <Picker.Item label="Keto" value="keto" />
            </Picker>
          )}
        />
        {errors.diet && <Text style={styles.errorText}>Required</Text>}

        <Button title="Submit" onPress={handleSubmit(onSubmit)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});