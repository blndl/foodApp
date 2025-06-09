import { StyleSheet } from "react-native";
import { baseFontSize, colors, windowWidth } from "./global";

const formStyle = StyleSheet.create({
  authForm: {
    padding: 20,
  },

  label: {
    color: colors.darkGreen,
    paddingLeft: 16,
    // fontWeight: "bold",
    fontSize: baseFontSize * 1.2,
    marginBottom: 4,
  },
  inputBloc: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    borderColor: colors.darkGreen,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "white",
  },

  button: {
    backgroundColor: colors.darkGreen,
    padding: 16,
    width: "auto",
    display: "flex",
    alignSelf: "flex-end",
    boxShadow: "5px 5px 0 0" + colors.peach,
    borderRadius: 16,
  },
  buttonText: {
    fontSize: baseFontSize * 1.2,
    color: colors.lightGreen,
  },

  errorText: {
    color: "red",
    marginBottom: 10,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
  },
  closeText: {
    fontSize: 24,
  },
});

export default formStyle;
