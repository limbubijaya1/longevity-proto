import React, { useEffect } from "react";
import TopNav from "./topNav";
import LowerNav from "./lowerNav";
import { View, StyleSheet, SafeAreaView } from "react-native";
import ProjectInformation from "./projectInformation";
import ProjectButton from "./projectButtons";
import MaterialTab from "./materialTab";
import MaterialContent from "./materialContent";
import MaterialBackButton from "./materialBackButton";

export default function MaterialPage() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <View style={styles.topContainer}>
          <TopNav />
        </View>
        <View style={styles.content}>
          <View style={styles.informationContainer}>
            <ProjectInformation />
            <ProjectButton />
          </View>
          <View>
            <MaterialTab />
          </View>
          <View style={styles.materialContainer}>
            <MaterialContent />
            <MaterialBackButton />
          </View>
        </View>
        <View style={styles.lowerContainer}>
          {/* <LowerNav /> */}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3eee3",
  },
  mainContainer: {
    flex: 1,
  },
  topContainer: {
    marginTop: 40,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    position: "relative",
  },
  informationContainer: {
    width: "95%",
    position: "relative",
  },
  lowerContainer: {
    justifyContent: "flex-end",
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "flex-start",
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  gridItem: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    margin: 6,
    alignItems: "center",
    justifyContent: "center",
    width: "30%",
    height: 80,
    minHeight: 120,
    minWidth: 150,
  },
  gridItemText: {
    fontSize: 15,
    color: "black",
    textAlign: "center",
  },
  materialContainer: {
    alignItems: "center",
    width: "100%",
    paddingBottom: 30,
  },
});
