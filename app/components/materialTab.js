import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setActiveTab } from "../../features/tabs/tabsSlice";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const MaterialTab = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.tabs.activeTab);
  const availableTabs = useSelector((state) => state.tabs.availableTabs);
  const flatListRef = useRef(null);

  const handleTabPress = (key, label, index) => {
    dispatch(setActiveTab({ key, label }));
    // Scroll to the pressed tab
    flatListRef.current.scrollToIndex({ index, animated: true });
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      key={item.key}
      style={[styles.tab, activeTab.key === item.key && styles.activeTab]}
      onPress={() => handleTabPress(item.key, item.label, index)}
    >
      <Text
        style={[
          styles.tabText,
          activeTab.key === item.key && styles.activeTabText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.arrowButton}>
        <MaterialIcons name="keyboard-arrow-left" size={25} color="orange" />
      </TouchableOpacity>
      <FlatList
        ref={flatListRef}
        data={availableTabs}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
        decelerationRate="fast"
        scrollEnabled={true}
      />
      <TouchableOpacity style={styles.arrowButton}>
        <MaterialIcons name="keyboard-arrow-right" size={25} color="orange" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center", // Align items vertically centered
    paddingHorizontal: 10, // Add padding to prevent icons from touching screen edges
    width: "100%",
    borderWidth: 0,
    marginBottom: 5,
  },
  arrowButton: {
    paddingHorizontal: 2, // Add padding for better touch area
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    color: "gray",
    lineHeight: 20,
    fontWeight: "bold",
  },
  activeTabText: {
    color: "orange",
    fontWeight: "bold",
  },
});

export default MaterialTab;
