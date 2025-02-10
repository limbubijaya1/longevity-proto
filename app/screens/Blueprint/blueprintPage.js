import React, { useState } from "react";
import TopNav from "../../components/topNav";
import { View, StyleSheet, SafeAreaView } from "react-native";
import ProjectInformation from "../../components/projectInformation";
import Blueprint from "./Blueprint";

export default function BlueprintPage() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <View style={styles.topContainer}>
          <TopNav />
        </View>
        <View style={styles.content}>
          <View style={styles.informationContainer}>
            <View>
              <ProjectInformation />
            </View>
          </View>
          <Blueprint />
        </View>
        <View style={styles.lowerContainer}>{/* <LowerNav /> */}</View>
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
});
