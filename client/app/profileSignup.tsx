import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import axiosInstance from "./axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";

import globalStyle from "./styles/global";
import formStyle from "./styles/form";
import CustomButton from "./components/customButton";

export default function ProfileSignup() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        Alert.alert("Error", "User not logged in");
        router.replace("/login");
        return;
      }
      console.log("avant");

      const response = await axiosInstance.post("/profiles/newProfile", {
        ...data,
        userId: parseInt(userId),
      });
      console.log("pres");
      if (response.status === 201) {
        //Alert.alert('Profile Created', 'Your profile was successfully created', [
        //{ text: 'OK', onPress: () => router.push('/home') },
        //]);
        router.push("/home");
      }
    } catch (error: any) {
      console.error("Error creating profile:", error.message);
      Alert.alert("Profile Creation Failed", error.message);
    }
  };

  return (
    <SafeAreaView style={globalStyle.body}>
      <View style={formStyle.createProfileForm}>
        <Text style={formStyle.label}>Nom du profil</Text>
        <Controller
          control={control}
          name="profileName"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={formStyle.input}
              onChangeText={onChange}
              value={value || ""}
              placeholder="Emma"
              placeholderTextColor="#999"
              id="profileName"
            />
          )}
        />
        {errors.profileName && <Text style={styles.errorText}>Required</Text>}

        <Text style={formStyle.label}>Age</Text>
        <Controller
          control={control}
          name="age"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={formStyle.input}
              onChangeText={(text) => onChange(Number(text))}
              value={value?.toString() || ""}
              keyboardType="numeric"
              placeholder="24"
              placeholderTextColor="#999"
              id="age"
            />
          )}
        />
        {errors.age && <Text style={styles.errorText}>Required</Text>}

        <Text style={formStyle.label}>Genre</Text>
        <Controller
          control={control}
          name="gender"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <Picker selectedValue={value} onValueChange={onChange} style={formStyle.input}>
              <Picker.Item label="Choisir" value="" />
              <Picker.Item label="Masculin" value="M" />
              <Picker.Item label="Feminin" value="F" />
              <Picker.Item label="Autre" value="O" />
            </Picker>
            // <TextInput style={formStyle.input} onChangeText={onChange} value={value || ""} />
          )}
        />
        {errors.gender && <Text style={styles.errorText}>Required</Text>}

        <Text style={formStyle.label}>Taille (en cm)</Text>
        <Controller
          control={control}
          name="height"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={formStyle.input}
              onChangeText={(text) => onChange(Number(text))}
              value={value?.toString() || ""}
              keyboardType="decimal-pad"
              placeholder="175"
              placeholderTextColor="#999"
              id="height"
            />
          )}
        />
        {errors.height && <Text style={styles.errorText}>Required</Text>}

        <Text style={formStyle.label}>Poids (kg)</Text>
        <Controller
          control={control}
          name="weight"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={formStyle.input}
              onChangeText={(text) => onChange(Number(text))}
              value={value?.toString() || ""}
              keyboardType="decimal-pad"
              placeholder="82"
              placeholderTextColor="#999"
              id="weight"
            />
          )}
        />
        {errors.weight && <Text style={styles.errorText}>Required</Text>}

        <Text style={formStyle.label}>Activité sportive par semaine</Text>
        <Controller
          control={control}
          name="activityLevel"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            // TODO: changer les value ici et dans le reste du code par un niveau (0,1,2,3)
            <Picker selectedValue={value} onValueChange={onChange} style={formStyle.input}>
              <Picker.Item label="Choisir" value="" />
              <Picker.Item label="0" value="none" />
              <Picker.Item label="1-2" value="a bit" />
              <Picker.Item label="3-4" value="a lot" />
              <Picker.Item label="4+" value="professional level" />
            </Picker>
          )}
        />
        {errors.activityLevel && <Text style={styles.errorText}>Required</Text>}

        <Text style={formStyle.label}>Objectif</Text>
        <Controller
          control={control}
          name="objective"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <Picker selectedValue={value} onValueChange={onChange} style={formStyle.input}>
              <Picker.Item label="Séléctionner un objectif" value="" />
              <Picker.Item label="Prendre du poids" value="gain weight" />
              <Picker.Item label="Perdre du poids" value="lose weight" />
              <Picker.Item label="Prendre du muscle" value="gain muscle mass" />
              <Picker.Item label="Maintenir la forme" value="maintain weight" />
            </Picker>
          )}
        />
        {errors.objective && <Text style={styles.errorText}>Required</Text>}

        <Text style={formStyle.label}>Régime alimentaire</Text>
        <Controller
          control={control}
          name="diet"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <Picker selectedValue={value} onValueChange={onChange} style={formStyle.input}>
              <Picker.Item label="Choisir" value="" />
              <Picker.Item label="Omnivore" value="non-vegetarian" />
              <Picker.Item label="Végétarien" value="vegetarian" />
              <Picker.Item label="Vegan" value="vegan" />
            </Picker>
          )}
        />
        {errors.diet && <Text style={styles.errorText}>Required</Text>}

        <CustomButton
          title="Submit"
          onPress={handleSubmit(onSubmit)}
          buttonStyle={formStyle.button}
          textStyle={formStyle.buttonText}
        ></CustomButton>
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
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});
