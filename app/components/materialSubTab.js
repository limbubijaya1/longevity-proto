import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setActiveSubTab } from "../../features/tabs/tabsSlice";

const labels = {
  english: {
    candidateMaterials: "Candidate Materials",
    confirmationRecord: "Confirmation Record",
    variableOrder: "Variable Order",
    milestone: "Milestone",
    defects: "Defects",
    contact: "Contacts",
  },
  chinese: {
    candidateMaterials: "候选材料",
    confirmationRecord: "确认记录",
    variableOrder: "可变订单",
    milestone: "里程碑",
    defects: "缺陷",
    contact: "聯絡人",
  },
};

const MaterialSubTab = () => {
  const dispatch = useDispatch();
  const subTab = useSelector((state) => state.tabs.subTab);
  const currentLanguage = useSelector((state) => state.language.language);
  const [items, setItems] = useState([]);
  const flatListRef = useRef(null);

  const updateItems = () => {
    const languageLabels =
      currentLanguage === "zh" ? labels.chinese : labels.english;

    const newItems = [
      { label: languageLabels.candidateMaterials, key: "candidate_materials" },
      { label: languageLabels.confirmationRecord, key: "confirmation_record" },
      { label: languageLabels.variableOrder, key: "variable_order" },
      { label: languageLabels.milestone, key: "milestone" },
      { label: languageLabels.defects, key: "defects" },
      { label: languageLabels.contact, key: "contact" },
    ];

    setItems(newItems);
  };

  useEffect(() => {
    updateItems(); // Update items whenever the language changes
  }, [currentLanguage]);

  const handleTabPress = (key, index) => {
    dispatch(setActiveSubTab(key));
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true }); // Scroll to the pressed tab
    }
  };

  const renderItem = ({ item, index }) => {

    return (
      <TouchableOpacity
        key={item.key}
        style={[
          styles.tab,
          subTab === item.key ? styles.activeTab : styles.inactiveTab,
        ]}
        onPress={() => handleTabPress(item.key, index)} // Pass the index to handleTabPress
      >
        <Text
          style={[styles.tabText, subTab === item.key && styles.activeTabText]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
        scrollEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center", // Align items vertically centered
    paddingHorizontal: 40, // Add padding to prevent icons from touching screen edges
    height: 42,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 0,
  },
  tab: {
    marginBottom: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    borderRadius: 360,
    flex: 1,
  },
  activeTab: {
    backgroundColor: "#ffe8d6",
    borderColor: "orange",
    borderWidth: 2,
  },
  inactiveTab: {
    borderColor: "#f3eee3",
    borderWidth: 2,
  },
  tabText: {
    fontSize: 13,
    color: "gray",
    lineHeight: 20,
    fontWeight: "bold",
    padding: 4,
  },
  activeTabText: {
    color: "orange",
    fontWeight: "bold",
  },
});

export default MaterialSubTab;
