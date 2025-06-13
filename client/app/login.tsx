import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, Alert, TouchableOpacity } from "react-native";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useRouter } from "expo-router";
import axios from "axios";
//import * as SecureStore from 'expo-secure-store';
import AsyncStorage from "@react-native-async-storage/async-storage";
import formStyle from "./styles/form";
import globalStyle, { colors } from "./styles/global";
import CustomButton from "./components/customButton";

export default function Login() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      console.log("Login form data:", data);

      const response = await axios.post('http://localhost:8080/auth/login', data);
      console.log('Login response:', response.data);

      const { accessToken, refreshToken, userId } = response.data;

      if (!accessToken || !refreshToken || !userId) {
        console.error("Missing token or userId in response:", response.data);
        Alert.alert("Login Failed", "Invalid server response");
        return;
      }

      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("userId", userId.toString());

      console.log("Access Token saved:", accessToken);
      console.log("Refresh Token saved:", refreshToken);
      console.log("User ID saved:", userId);

      router.push("./home");
    } catch (error: any) {
      console.error("Login error:", error?.response?.data || error.message);
      Alert.alert("Login Failed", "Invalid credentials or server error");
    }
  };

  return (
    <SafeAreaView style={[globalStyle.body]}>
      <Text style={globalStyle.mainTitle}>Connectez vous</Text>
      <View style={formStyle.authForm}>
        <div style={formStyle.inputBloc}>
          <Text style={formStyle.label}>Email</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={formStyle.input} onBlur={onBlur} onChangeText={onChange} value={value} />
            )}
            name="email"
            rules={{ required: true }}
          />
          {errors.email && <Text style={formStyle.errorText}>emailrequired</Text>}
        </div>
        <div style={formStyle.inputBloc}>
          <Text style={formStyle.label}>Password</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={formStyle.input} onBlur={onBlur} onChangeText={onChange} value={value} />
            )}
            name="password"
            rules={{ required: true }}
          />
          {errors.password && <Text style={formStyle.errorText}>Password required</Text>}
        </div>
        <CustomButton
          title={"Se connecter"}
          onPress={handleSubmit(onSubmit)}
          buttonStyle={formStyle.button}
          textStyle={formStyle.buttonText}
        ></CustomButton>

        <Text style={globalStyle.text}>Pas encore de compte ?</Text>
        <Link style={[globalStyle.link]} href="/signup">
          Inscrivez vous ici
        </Link>
      </View>
    </SafeAreaView>
  );
}
