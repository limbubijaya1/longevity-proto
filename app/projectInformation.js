import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";

export default function ProjectInformation() {
  const project = useSelector((state) => state.project.project);
  const router = useRouter();

  const handleBackButtonPress = async () => {
    router.push("/");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Format the date to a locale-specific string
  };

  return (
    <View>
      <View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackButtonPress}
        >
          <View style={styles.backButtonContent}>
            <MaterialIcons
              name="keyboard-arrow-left"
              style={styles.backIcon}
              size={30}
            />
            <Text style={styles.backButtonText}>{project.project_title}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <View style={styles.subContainer}>
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>Project Details</Text>
          </View>
          <View>
            <Text style={styles.title}>{project.project_duration} Days</Text>
          </View>
        </View>
        <View style={styles.subContainer}>
          <View style={styles.detailsContainer}>
            <Text
              style={styles.text}
              adjustsFontSizeToFit={true}
              numberOfLines={1}
            >
              Owner Name: {project.quotee_name} 
            </Text>
          </View>
          <View style={styles.durationContainer}>
            <Text
              style={styles.text}
              adjustsFontSizeToFit={true}
              numberOfLines={1}
            >
              Tel: {project.quotee_mobile}
            </Text>
          </View>
        </View>
        <View style={styles.subContainer}>
          <View style={styles.detailsContainer}>
            <Text
              style={styles.text}
              adjustsFontSizeToFit={true}
              numberOfLines={1}
            >
              Start Date: {formatDate(project.project_start_date)}
            </Text>
          </View>
          <View style={styles}>
            <Text
              style={styles.text}
              adjustsFontSizeToFit={true}
              numberOfLines={1}
            >
              End Date: {formatDate(project.project_end_date)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "white",
    borderRadius: 10,
    margin: 5,
  },
  subContainer: {
    flexDirection: "row",
  },
  detailsContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  durationContainer: {
    width: 125,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 2,
    fontSize: 18,
  },
  text: {
    fontSize: 13,
    lineHeight: 25,
  },
  backButton: {
    padding: 5,
    paddingLeft: 2,
  },
  backButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    fontWeight: "bold",
    fontSize: 22,
  },
});
