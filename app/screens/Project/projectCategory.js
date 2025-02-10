import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import {
  setActiveTab,
  setAvailableTabs,
} from "../../../features/tabs/tabsSlice";
import words from "../../../constants/words";

export default function ProjectCategory() {
  const API_URL = process.env.EXPO_API_URL;
  const dispatch = useDispatch();
  const router = useRouter();
  const activeProject = useSelector((state) => state.project.project);
  const currentLanguage = useSelector((state) => state.language.language); // Get current language
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [ccName, setCcName] = useState("");
  const currentWord = currentLanguage === "zh" ? words.chinese : words.english;

  useEffect(() => {
    if (activeProject) {
      fetchProjectCategory();
    }
  }, [activeProject, currentLanguage]);

  const fetchProjectCategory = async () => {
    setLoading(true);
    try {
      const storedUserId = await AsyncStorage.getItem("user_id");

      if (storedUserId && activeProject) {
        const response = await axios.get(
          `${API_URL}/get-construction-category-from-project/${activeProject.project_id}`
        );

        const constructionCategories = response.data["construction categories"];

        // Check if constructionCategories is defined and is an array
        if (Array.isArray(constructionCategories)) {
          const formattedCategories = constructionCategories.map(
            (category) => ({
              key: category.cc_id,
              label: category.cc_name,
            })
          );
          setCategories(formattedCategories);
        } else {
          setCategories([]); // Set to an empty array if no categories found
        }
      }
    } catch (error) {
      console.error("Error fetching project categories:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  const handleItemPress = (key, label) => {
    dispatch(setActiveTab({ key, label }));
    dispatch(setAvailableTabs(categories));
    router.push("screens/Material/materialPage");
  };

  const handleAddPress = () => {
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    const storedUserId = await AsyncStorage.getItem("user_id");
    if (storedUserId && activeProject) {
      try {
        await axios.post(`${API_URL}/add-construction-category`, {
          cc_name: ccName,
          project_id: activeProject.project_id,
          user_id: storedUserId,
        });
        // Optionally: Fetch categories again to include the new one
        fetchProjectCategory();
        setCcName(""); // Clear the input
        setModalVisible(false); // Close the modal
      } catch (error) {
        console.error("Error adding category:", error);
      }
    }
  };

  const handleCancel = () => {
    setCcName(""); // Clear the input
    setModalVisible(false); // Close the modal
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.verticalGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={
                currentLanguage === "zh"
                  ? styles.gridItem
                  : styles.horizontalBar
              }
              onPress={() => handleItemPress(category.key, category.label)}
            >
              <Text
                style={
                  currentLanguage === "zh"
                    ? styles.gridItemText
                    : styles.horizontalItemText
                }
                adjustsFontSizeToFit={true}
                numberOfLines={2}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={
              currentLanguage === "zh" ? styles.gridItem : styles.horizontalBar
            }
            onPress={handleAddPress}
          >
            <Text style={styles.gridItemText}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel} // Handle back button press
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentWord.modalTitleCategory}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={currentWord.modalPlaceholderCategory}
              value={ccName}
              onChangeText={setCcName}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.confirmButton, !ccName && styles.disabledButton]} // Disable button if ccName is empty
                onPress={ccName ? handleConfirm : null} // Prevent onPress if ccName is empty
              >
                <Text style={styles.buttonText}>{currentWord.confirm}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.buttonText}>{currentWord.cancel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "flex-start", // Center content vertically
    alignItems: "center", // Center content horizontally
    width: "100%",
  },
  horizontalBar: {
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 30,
    marginBottom: 10,
    borderRadius: 30,
    width: 320,
  },
  horizontalItemText: {
    fontSize: 15,
  },
  verticalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center", // Center items in horizontal grid
    alignItems: "center", // Center items in horizontal grid
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
    width: 100,
    height: 100,
  },
  gridItemText: {
    fontSize: 13,
    color: "black",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  confirmButton: {
    backgroundColor: "orange",
    borderRadius: 5,
    padding: 10,
    flex: 1,
    marginRight: 5,
  },
  disabledButton: {
    backgroundColor: "lightgray",
  },
  cancelButton: {
    backgroundColor: "gray",
    borderRadius: 5,
    padding: 10,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});
