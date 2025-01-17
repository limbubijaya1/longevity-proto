import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setActiveSubTab } from "../features/tabs/tabsSlice";

const items = [
  { label: "Candidate Materials", key: "candidate_materials" },
  { label: "Confirmation Record", key: "confirmation_record" },
  { label: "Variable Order", key: "variable_order" },
  { label: "Milestone", key: "milestone" },
  { label: "Details", key: "details" },
];

const MaterialSubTab = () => {
  const dispatch = useDispatch();
  const subTab = useSelector((state) => state.tabs.subTab);

  const handleTabPress = (key) => {
    dispatch(setActiveSubTab(key));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.tab, subTab === item.key]}
            onPress={() => handleTabPress(item.key)}
          >
            <Text
              style={[
                styles.tabText,
                subTab === item.key && styles.activeTabText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center", // Align items vertically centered
    paddingHorizontal: 60, // Add padding to prevent icons from touching screen edges
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 0,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 1,
    alignItems: "center",
  },
  tabText: {
    fontSize: 13,
    color: "gray",
    lineHeight: 20,
    fontWeight: "bold",
    padding: 4,
    borderWidth: 2,
    borderColor: "#f3eee3",
  },

  activeTabText: {
    color: "orange",
    fontWeight: "bold",
    borderColor: "orange",
    borderWidth: 2,
    borderRadius: 360,
    padding: 4,
  },
});

export default MaterialSubTab;
