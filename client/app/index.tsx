import React from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";
import globalStyle from "./styles/global";
import homeStyle from "./styles/home";

const Index = () => {
  return (
    <View style={globalStyle.body}>
      <Text style={globalStyle.mainTitle}>Food 4 Me</Text>
      <Text style={homeStyle.catchPhrase}>Le guide nutritionnel au quotidien</Text>
      <div style={homeStyle.authZone}>
        <Link style={[globalStyle.link, homeStyle.authLink]} href="/login">
          Connexion
        </Link>
        <Link style={[globalStyle.link, homeStyle.authLink]} href="/signup">
          Inscription
        </Link>
      </div>
    </View>
  );
};

export default Index;
