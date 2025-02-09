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
import { setActiveSubTab } from "../../../features/tabs/tabsSlice";
import words from "../../../constants/words";

const MaterialContent = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentLanguage = useSelector((state) => state.language.language);
  const currentWord = currentLanguage === "zh" ? words.chinese : words.english;

  const items = [
    {
      label: currentWord.candidateMaterials,
      key: "candidate_materials",
    },
    {
      label: currentWord.confirmationRecord,
      key: "confirmation_record",
    },
    {
      label: currentWord.variableOrder,
      key: "variable_order",
    },
    {
      label: currentWord.milestone,
      key: "milestone",
    },
    {
      label: currentWord.defects,
      key: "defects",
    },
    {
      label: currentWord.contact,
      key: "contact",
    },
  ];

  const navigateTo = (key) => {
    dispatch(setActiveSubTab(key));
    router.push("screens/Material/materialSubPage");
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
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 10,
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
