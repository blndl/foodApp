import { StyleSheet, Dimensions } from "react-native";

export const colors = {
  peach: "#f1bf98",
  darkGreen: "#4a6c6f",
  lightGreen: "#e1f4cb",
};
export const baseFontSize = 16;
export const windowWidth = Dimensions.get("window").width;
export const windowHeight = Dimensions.get("window").height;

const globalStyle = StyleSheet.create({
  body: {
    backgroundColor: colors.lightGreen,
    flex: 1,
  },
  mainTitle: {
    color: colors.darkGreen,
    fontSize: baseFontSize * 3, // gestion em
    fontFamily: "SourGummy",
    textAlign: "center",
  },
  link: {
    color: colors.darkGreen,
    textDecorationLine: "underline",
  },
  text: {
    color: colors.darkGreen,
  },

  peachShadow: {
    boxShadow: "5px 5px 0 0" + colors.peach,
  },
  lightGreenText: {
    color: colors.lightGreen,
  },
  darkGreenText: {
    color: colors.darkGreen,
  },
});

export default globalStyle;
