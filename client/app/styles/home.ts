import { StyleSheet } from "react-native";
import { colors, windowWidth } from "./global";

const homeStyle = StyleSheet.create({
  catchPhrase: {
    fontStyle: "italic",
    color: colors.darkGreen,
    textAlign: "center",
  },
  authZone: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    width: windowWidth * 0.5,
    marginTop: 20,
    marginLeft: "auto",
    marginRight: "auto",
  },

  authLink: {
    padding: 8,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: colors.darkGreen,
    borderRadius: 8,
    backgroundColor: colors.darkGreen,
    color: colors.lightGreen,
    textDecorationLine: "none",
    boxShadow: "5px 5px 0 0" + colors.peach,
  },
});

export default homeStyle;
