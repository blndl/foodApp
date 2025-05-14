import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, Alert } from 'react-native';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function Signup() {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
        const response = await axios.post('http://10.60.180.125/8080/signup', data);
        if (response.status === 200) {
          router.push('/login');
        }
      } catch (error) {
        Alert.alert('signup Failed', 'Invalid credentials');
      }
    };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text>Username</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value || ''}
            />
          )}
          name="username"
          rules={{ required: true, }}
        />
        {errors.username && <Text style={styles.errorText}>Username required</Text>}

        <Text>Password</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value || ''}
            />
          )}
          name="password"
          rules={{ required: true, }}
        />
        {errors.username && <Text style={styles.errorText}>Password required</Text>}

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
});