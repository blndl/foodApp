import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import axios from 'axios';
//import * as SecureStore from 'expo-secure-store';
import axiosInstance from './axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Login() {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      console.log('Login form data:', data);

      const response = await axios.post('http://localhost:8080/login', data);
      console.log('Login response:', response.data);

      const { accessToken, refreshToken, userId } = response.data;

      if (!accessToken || !refreshToken || !userId) {
        console.error('Missing token or userId in response:', response.data);
        Alert.alert('Login Failed', 'Invalid server response');
        return;
      }

      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('userId', userId.toString());

      console.log('Access Token saved:', accessToken);
      console.log('Refresh Token saved:', refreshToken);
      console.log('User ID saved:', userId);

      router.push('/home');
    } catch (error: any) {
      console.error('Login error:', error?.response?.data || error.message);
      Alert.alert('Login Failed', 'Invalid credentials or server error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ backgroundColor: 'white' }}>
        <Text>email</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="email"
          rules={{ required: true }}
        />
        {errors.email && <Text style={styles.errorText}>emailrequired</Text>}

        <Text>Password</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="password"
          rules={{ required: true }}
        />
        {errors.password && <Text style={styles.errorText}>Password required</Text>}

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
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  closeText: {
    fontSize: 24,
  },
});