import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Link } from "expo-router";
import Feather from "react-native-vector-icons/Feather";

export default function LowerNav() {
  return (
    <View style={styles.container}>
      <Link style={styles.tab} href="/Quotation">
        <View style={styles.labelContainer}>
          <Feather name="folder" size={24} />
          <Text style={styles.label}>Quotation</Text>
        </View>
      </Link>
      <Link style={styles.tab} href="/Invoice">
        <View style={styles.labelContainer}>
          <Feather name="folder" size={24} />
          <Text style={styles.label}>Invoice</Text>
        </View>
      </Link>
      <Link style={styles.tab} href="/signin">
        <View style={styles.labelContainer}>
          <Feather name="folder" size={24} />
          <Text style={styles.label}>Payment</Text>
        </View>
      </Link>
      <Link style={styles.tab} href="/signin">
        <View style={styles.labelContainer}>
          <Feather name="folder" size={24} />
          <Text style={styles.label}>Resources</Text>
        </View>
      </Link>
      <Link style={styles.tab} href="/signin">
        <View style={styles.labelContainer}>
          <Feather name="folder" size={24} />
          <Text style={styles.label}>Main Page</Text>
        </View>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  tab: {
    alignItems: "center",
  },
  label: {
    marginTop: 2,
  },
  labelContainer: {
    alignItems: "center",
  },
});
