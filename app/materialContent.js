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
  const currentLanguage = useSelector((state) => state.language.language);

  const words = {
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

  const items = [
    {
      label:
        currentLanguage === "zh"
          ? words.chinese.candidateMaterials
          : words.english.candidateMaterials,
      key: "candidate_materials",
    },
    {
      label:
        currentLanguage === "zh"
          ? words.chinese.confirmationRecord
          : words.english.confirmationRecord,
      key: "confirmation_record",
    },
    {
      label:
        currentLanguage === "zh"
          ? words.chinese.variableOrder
          : words.english.variableOrder,
      key: "variable_order",
    },
    {
      label:
        currentLanguage === "zh"
          ? words.chinese.milestone
          : words.english.milestone,
      key: "milestone",
    },
    {
      label:
        currentLanguage === "zh"
          ? words.chinese.defects
          : words.english.defects,
      key: "defects",
    },
    {
      label:
        currentLanguage === "zh"
          ? words.chinese.contact
          : words.english.contact,
      key: "contact",
    },
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
