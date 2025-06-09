import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, Alert } from "react-native";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useRouter } from "expo-router";
import axios from "axios";

import formStyle from "./styles/form";
import globalStyle, { colors } from "./styles/global";
import CustomButton from "./components/customButton";

export default function Signup() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  const onSubmit = async (data: any) => {
    try {
<<<<<<< HEAD
      console.log('Sending signup request:', data);
      const response = await /*api*/axios.post('http://localhost:8080/auth/signup', data);
=======
      console.log("Sending signup request:", data);
      const response = await /*api*/ axios.post("http://localhost:8080/signup", data);
>>>>>>> 4bbc652258fb9de44b03ba1cb079f4708baa83b2

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      if (response.status === 201) {
        //console.log('Signup successful, showing alert...');
        //Alert.alert('Signup Successful', 'You can now login with your credentials', [
        //  { text: 'OK', onPress: () => {
        console.log("Navigating to login...");
        router.push("/login");
        //  }}
        //]);
      }
    } catch (error: any) {
      console.log("Signup failed");
      console.error("Signup error:", error.message);
      Alert.alert("Signup Failed", error.message);
    }
  };

  return (
    <SafeAreaView style={[globalStyle.body]}>
      <Text style={globalStyle.mainTitle}>Inscrivez vous</Text>
      <View style={formStyle.authForm}>
        <div style={formStyle.inputBloc}>
          <Text style={formStyle.label}>Email</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={formStyle.input} onBlur={onBlur} onChangeText={onChange} value={value || ""} />
            )}
            name="email"
            rules={{ required: true }}
          />
          {errors.email && <Text style={styles.errorText}>email required</Text>}
        </div>
        <div style={formStyle.inputBloc}>
          <Text style={formStyle.label}>Password</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={formStyle.input} onBlur={onBlur} onChangeText={onChange} value={value || ""} />
            )}
            name="password"
            rules={{ required: true }}
          />
          {errors.username && <Text style={styles.errorText}>Password required</Text>}
        </div>

        <CustomButton
          title={"Valider"}
          onPress={handleSubmit(onSubmit)}
          buttonStyle={formStyle.button}
          textStyle={formStyle.buttonText}
        ></CustomButton>

        <Text style={globalStyle.text}>Vous avez déjà un compte ?</Text>
        <Link style={[globalStyle.link]} href="/login">
          Connectez vous ici
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});
