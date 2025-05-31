import React from "react";
import { TouchableHighlight, Text, StyleSheet, TouchableHighlightProps, TextStyle, ViewStyle } from "react-native";

interface CustomButtonProps extends TouchableHighlightProps {
  title: string;
  onPress: () => void;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({ onPress, title, buttonStyle, textStyle }) => {
  return (
    <TouchableHighlight style={buttonStyle} onPress={onPress} underlayColor="#0056b3">
      <Text style={textStyle}>{title}</Text>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CustomButton;
