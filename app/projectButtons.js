import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";

export default function ProjectButton() {
  const currentLanguage = useSelector((state) => state.language.language);
  const currentWord = currentLanguage === "zh" ? words.chinese : words.english;

  const router = useRouter();

  const progressButton = () => {
    router.push("/progressPage");
  };

  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity style={styles.buttonContainer}>
        <Text style={styles.buttonText}>{currentWord.blueprint}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonContainer} onPress={progressButton}>
        <Text style={styles.buttonText}>{currentWord.progress}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
    paddingBottom: 8,
    width: "100%",
  },
  buttonContainer: {
    backgroundColor: "orange",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    margin: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    textAlign: "center",
  },
});

const words = {
  english: {
    blueprint: "Blueprint",
    progress: "Progress",
  },
  chinese: {
    blueprint: "藍圖",
    progress: "進度",
  },
};
