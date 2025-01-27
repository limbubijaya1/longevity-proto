import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";

export default function ProjectInformation() {
  const currentLanguage = useSelector((state) => state.language.language);
  const project = useSelector((state) => state.project.project);
  const router = useRouter();

  const currentWord = currentLanguage === "zh" ? words.chinese : words.english;

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
            <Text style={styles.title}>{currentWord.projectDeatils}</Text>
          </View>
          <View>
            <Text style={styles.title}>
              {project.project_duration} {currentWord.days}
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
              {currentWord.ownerName} {project.quotee_name}
            </Text>
          </View>
          <View style={styles.durationContainer}>
            <Text
              style={styles.text}
              adjustsFontSizeToFit={true}
              numberOfLines={1}
            >
              {currentWord.tel} {project.quotee_mobile}
            </Text>
          </View>
        </View>

        <View style={styles.subContainer}>
          <View style={styles.startDateContainer}>
            <Text style={styles.text} numberOfLines={1}>
              {currentWord.startDate} {formatDate(project.project_start_date)}
            </Text>
          </View>
          <View style={styles.endDateContainer}>
            <Text style={styles.text} numberOfLines={1}>
              {currentWord.endDate} {formatDate(project.project_end_date)}
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
    marginBottom: 3,
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
    fontSize: 15,
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
  startDateContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  endDateContainer: {
    flex: 1,
    alignItems: "flex-end", // Align to start for consistency
    justifyContent: "center",
  },
});

const words = {
  english: {
    ownerName: "Owner Name:",
    days: "Days",
    projectDeatils: "Project Details",
    tel: "Tel:",
    startDate: "Start Date:",
    endDate: "End Date:",
  },
  chinese: {
    ownerName: "擁有者名稱:",
    days: "日",
    projectDeatils: "項目詳情",
    tel: "電話:",
    startDate: "開始日期:",
    endDate: "結束日期:",
  },
};
