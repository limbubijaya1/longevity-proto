import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useDispatch } from "react-redux";
import {
  setActiveTab,
  setActiveSubTab,
  setAvailableTabs,
} from "../features/tabs/tabsSlice";

const MaterialBackButton = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const backButton = async () => {
    router.push("/projectPage");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    dispatch(setActiveTab({ key: null, label: null }));
    dispatch(setActiveSubTab(null));
    dispatch(setAvailableTabs([]));
  };

  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={backButton}
        >
          <FontAwesome name="arrow-left" size={25} color="orange" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    marginTop: 5,
    paddingRight: 22,
  },
  subContainer: {
    alignItems: "flex-end",
  },
  backButtonContainer: {
    width: 40, // Set a fixed width
    height: 40, // Set a fixed height
    borderRadius: 25, // Make it circular
    justifyContent: "center", // Center the icon
    alignItems: "center", // Center the icon
    borderColor: "orange",
    borderWidth: 5, // Border width
  },
});

export default MaterialBackButton;
