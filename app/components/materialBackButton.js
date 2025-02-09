import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import {
  setActiveTab,
  setActiveSubTab,
  setAvailableTabs,
} from "../../features/tabs/tabsSlice";

const MaterialBackButton = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const backButton = async () => {
    router.push("screens/Project/projectPage");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    dispatch(setActiveTab({ key: null, label: null }));
    dispatch(setActiveSubTab(null));
    dispatch(setAvailableTabs([]));
  };

  return (
    <View>
      <TouchableOpacity style={styles.backButtonContainer} onPress={backButton}>
        <Ionicons name="arrow-back-circle-outline" size={40} color="orange" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  backButtonContainer: {
    justifyContent: "center", // Center the icon
    alignItems: "center", // Center the icon
    borderColor: "orange",
  },
});

export default MaterialBackButton;
