import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useRouter } from "expo-router";

export default function Progress() {
  const [categories, setCategories] = useState([]); // State to hold category progress
  const [project, setProject] = useState({}); // State to hold project data
  const ActiveProject = useSelector((state) => state.project.project);
  const [loading, setLoading] = useState(true); // Loading state
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchProjectProgress();
      await fetchCategoryProgress();
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchProjectProgress = async () => {
    const storedUserId = await AsyncStorage.getItem("user_id");
    if (storedUserId) {
      try {
        const response = await axios.get(
          `http://34.57.68.176:8000/get-project-progress/${ActiveProject.project_id}`
        );
        if (response.data) {
          const projectData = {
            progress: parseFloat(response.data.progress_percent) || 0,
            duration: response.data.project_duration,
            startDate: new Date(response.data.project_start_date),
            endDate: new Date(response.data.project_end_date),
          };
          setProject(projectData);
        }
      } catch (error) {
        console.error("Error fetching project progress:", error);
      }
    }
  };

  const fetchCategoryProgress = async () => {
    const storedUserId = await AsyncStorage.getItem("user_id");
    if (storedUserId) {
      try {
        const response = await axios.get(
          `http://34.57.68.176:8000/progress-of-each-category/${ActiveProject.project_id}`
        );
        if (response.data.category_progress_info) {
          const sortedCategories = response.data.category_progress_info.sort(
            (a, b) => a.cc_id.localeCompare(b.cc_id)
          );
          setCategories(sortedCategories);
        }
      } catch (error) {
        console.error("Error fetching category progress:", error);
      }
    }
  };

  const backButton = () => {
    router.back();
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible); // Toggle modal visibility
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="orange"
          style={styles.loadingIndicator}
        />
      ) : (
        <>
          <View style={styles.topContainer}>
            <View style={styles.leftTopContainer}>
              <TouchableOpacity
                style={styles.backButtonContainer}
                onPress={backButton}
              >
                <FontAwesome name="arrow-left" size={20} color="orange" />
              </TouchableOpacity>
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressText}>Progress</Text>
              </View>
              <Text style={styles.projectDuration}>
                {project.duration} Days
              </Text>
            </View>
            <View style={styles.rightTopContainer}>
              <TouchableOpacity
                style={styles.infoButtonContainer}
                onPress={toggleModal}
              >
                <Ionicons name="information-circle" size={35} color="orange" />
              </TouchableOpacity>
            </View>
          </View>

          <ProgressBar progress={project.progress} />

          <ScrollView>
            {categories.length === 0 ? (
              <Text style={styles.noTasksText}>
                There are no categories available.
              </Text>
            ) : (
              categories.map((category) => (
                <View key={category.cc_id} style={styles.categoryContainer}>
                  <View style={styles.categoryName}>
                    <Text style={styles.categoryName}>{category.cc_name}</Text>
                  </View>
                  <View style={styles.categoryProgressBarContainer}>
                    <ProgressBarCategory
                      startDate={new Date(category.start_date)}
                      endDate={new Date(category.end_date)}
                      projectStartDate={project.startDate}
                      projectEndDate={project.endDate}
                      categoryStatus={category.category_status}
                    />
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={toggleModal}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Color Information</Text>
                <View style={styles.modalTextContainer}>
                  <View style={styles.colorBlockYellow} />
                  <Text style={styles.modalText}>
                    Yellow: Whole Project Progress
                  </Text>
                </View>
                <View style={styles.modalTextContainer}>
                  <View style={styles.colorBlockGreen} />
                  <Text style={styles.modalText}>Green: Completed</Text>
                </View>
                <View style={styles.modalTextContainer}>
                  <View style={styles.colorBlockOrange} />
                  <Text style={styles.modalText}>
                    Orange: Risky/Uncompleted
                  </Text>
                </View>
                <View style={styles.modalTextContainer}>
                  <View style={styles.colorBlockGray} />
                  <Text style={styles.modalText}>Gray: Upcoming</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={toggleModal}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

const ProgressBar = ({ progress }) => {
  const widthPercentage = Math.min(100, Math.max(0, progress)); // Clamp between 0 and 100
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${widthPercentage}%` }]} />
    </View>
  );
};

const ProgressBarCategory = ({
  startDate,
  endDate,
  projectStartDate,
  projectEndDate,
  categoryStatus, // Add categoryStatus prop
}) => {
  const totalProjectDuration = projectEndDate - projectStartDate;

  // Ensure valid dates
  if (
    isNaN(startDate.getTime()) ||
    isNaN(endDate.getTime()) ||
    totalProjectDuration <= 0
  ) {
    console.error(
      "Invalid dates or total duration:",
      startDate,
      endDate,
      totalProjectDuration
    );
    return null; // Exit if dates are invalid or total duration is non-positive
  }

  // Calculate the colored portion's width
  const coloredStart = Math.max(
    0,
    ((startDate - projectStartDate) / totalProjectDuration) * 100
  );
  const coloredWidth = Math.min(
    100,
    ((endDate - startDate) / totalProjectDuration) * 100
  );

  // Determine the background color based on category status
  let barColor;
  switch (categoryStatus) {
    case "completed":
      barColor = "#82b86a";
      break;
    case "risky":
      barColor = "orange";
      break;
    case "upcoming":
      barColor = "#d1ced3";
      break;
    default:
      barColor = "gold"; // Default color if status is unknown
  }

  return (
    <View style={styles.categoryProgressBarContainer}>
      {/* Only the colored portion */}
      <View
        style={[
          styles.categoryProgressBar,
          {
            width: `${coloredWidth}%`,
            backgroundColor: barColor, // Use the dynamic color
            position: "absolute",
            left: `${coloredStart}%`,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingIndicator: {
    marginTop: 20,
  },
  container: {
    flex: 1,
    borderWidth: 0,
  },
  topContainer: {
    flexDirection: "row",
    marginVertical: 5,
    alignItems: "center",
  },
  leftTopContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  rightTopContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  backButtonContainer: {
    width: 35,
    height: 35,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "orange",
    borderWidth: 5,
    marginRight: 5,
  },
  infoButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 35,
    height: 35,
  },
  progressTextContainer: {
    borderWidth: 0,
    backgroundColor: "orange",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "25%",
    height: 35,
  },
  progressText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  projectDuration: {
    marginLeft: 5,
    fontSize: 15,
    color: "grey",
    fontWeight: "bold",
  },
  categoryContainer: {
    flexDirection: "column",
    marginVertical: 5,
    borderRadius: 15,
    backgroundColor: "#eeeee4",
    width: "100%",
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    paddingTop: 1,
    paddingLeft: 3,
  },
  categoryProgressBarContainer: {
    height: 20,
    borderRadius: 10,
    backgroundColor: "white", // Light gray background for the entire bar
    position: "relative",
    width: "100%", // Adjust as needed
  },
  categoryProgressBar: {
    height: "100%",
    borderRadius: 10,
  },
  noTasksText: {
    textAlign: "center",
    fontSize: 15,
    color: "#d1ced3",
    marginTop: 20,
  },
  progressBarContainer: {
    height: 25,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
    position: "relative",
    width: 320,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "gold",
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  colorBlockYellow: {
    width: 20,
    height: 20,
    backgroundColor: "gold",
    borderRadius: 3,
    marginRight: 10,
  },
  colorBlockGreen: {
    width: 20,
    height: 20,
    backgroundColor: "#82b86a",
    borderRadius: 3,
    marginRight: 10,
  },
  colorBlockOrange: {
    width: 20,
    height: 20,
    backgroundColor: "orange",
    borderRadius: 3,
    marginRight: 10,
  },
  colorBlockGray: {
    width: 20,
    height: 20,
    backgroundColor: "#d1ced3",
    borderRadius: 3,
    marginRight: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
