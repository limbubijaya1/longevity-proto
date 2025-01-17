import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import CandidateMaterials from "./CandidateMaterials.js"; // Import your screen components
import ConfirmationRecord from "./ConfirmationRecord";
import VariableOrder from "./VariableOrder";
import Milestone from "./Milestone.js";
// import Details from "./Details";

export default function MaterialSubTabScreen() {
  const subTab = useSelector((state) => state.tabs.subTab);

  const renderScreen = () => {
    switch (subTab) {
      case "candidate_materials":
        return <CandidateMaterials />;
      case "confirmation_record":
        return <ConfirmationRecord />;
        case "variable_order":
          return <VariableOrder />;
      case "milestone":
        return <Milestone />;
      //   case "details":
      //     return <Details />;
      default:
        return;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 10,
    height: "64%",
  },
});
