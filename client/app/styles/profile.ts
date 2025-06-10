import { StyleSheet } from "react-native";
import { baseFontSize, colors, windowWidth } from "./global";

const profileStyle = StyleSheet.create({
  profilesList: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    flexDirection: "row",
    marginTop: 32,
  },

  profile: {
    alignItems: "center",
    gap: 16,
    justifyContent: "center",
  },

  profileIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.darkGreen,
    borderRadius: windowWidth,
    fontSize: windowWidth * 0.18,
    width: windowWidth * 0.35,
    height: windowWidth * 0.35,
  },
  profileName: {
    fontSize: baseFontSize * 1.5,
  },

  addProfileBtn: {
    backgroundColor: colors.lightGreen,
    borderStyle: "dashed",
    borderColor: colors.darkGreen,
    borderWidth: 5,
  },
});

export default profileStyle;
