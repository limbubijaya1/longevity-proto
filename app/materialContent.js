import React from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useSelector, useDispatch } from "react-redux";
import { setActiveSubTab } from "../features/tabs/tabsSlice";

const MaterialContent = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const items = [
    { label: "Candidate Materials", key: "candidate_materials" },
    { label: "Confirmation Record", key: "confirmation_record" },
    { label: "Variable Order", key: "variable_order" },
    { label: "Milestone", key: "milestone" },
    { label: "Details", key: "details" },
  ];
  const navigateTo = (key) => {
    dispatch(setActiveSubTab(key));
    router.push("/materialSubPage");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            onPress={() => navigateTo(item.key)}
          >
            <Text style={styles.itemText}>{item.label}</Text>
            <Ionicons
              name="play-circle-outline"
              size={40}
              color="gray"
              style={styles.playButton}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "70%",
    backgroundColor: "#f3eee3",
    paddingHorizontal: 5,
  },
  scrollView: {
    flexGrow: 1,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    width: 320,
    paddingHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 30,
    marginBottom: 6,
  },
  itemText: {
    fontSize: 16,
    color: "black",
  },
});

export default MaterialContent;
