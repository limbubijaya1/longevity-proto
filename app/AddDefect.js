import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  TextInput,
} from "react-native";
import { useSelector } from "react-redux";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { Dropdown } from "react-native-element-dropdown";
import words from "../constants/words";

const AddDefect = ({ onUploadSuccess }) => {
  const currentLanguage = useSelector((state) => state.language.language);
  const [loading, setLoading] = useState(false);
  const [isAddDefectModalVisible, setIsAddDefectModalVisible] = useState(false);
  const [areas, setAreas] = useState([]);
  const [area_id, setAreaId] = useState();
  const user_id = useSelector((state) => state.user.userId);
  const cc_id = useSelector((state) => state.tabs.activeTab.key);
  const [imageUris, setImageUris] = useState([]);
  const [defect_description, setDefectDescription] = useState("");
  const project_id = useSelector((state) => state.project.project.project_id);
  const currentWord = currentLanguage === "zh" ? words.chinese : words.english;

  useEffect(() => {
    if (isAddDefectModalVisible) {
      fetchAreas();
    }
  }, [isAddDefectModalVisible]);

  const fetchAreas = async () => {
    console.log(project_id);

    try {
      const response = await axios.get(
        `http://34.57.68.176:8000/all-area-descriptions-of-one-project/${project_id}`
      );
      if (Array.isArray(response.data.area_descriptions)) {
        setAreas(response.data.area_descriptions);
        console.log(areas);
      } else {
        console.error("Unexpected response format:", response.data);
        Alert.alert(currentWord.error, "Unexpected response format.");
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
      Alert.alert(currentWord.error, currentWord.fetchError);
    }
  };

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== "granted") {
      Alert.alert(currentWord.error, currentWord.cameraPermissionError);
    }

    const mediaLibraryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaLibraryPermission.status !== "granted") {
      Alert.alert(currentWord.error, currentWord.mediaLibraryPermissionError);
    }
  };

  const handleImageUpload = async () => {
    await requestPermissions();

    Alert.alert(currentWord.chooseOption, currentWord.selectPhoto, [
      {
        text: currentWord.camera,
        onPress: async () => {
          setImageUris([]);
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: "images",
            quality: 1,
          });
          if (result.cancelled) {
            setImageUris([]);
          } else {
            setImageUris([result.assets[0].uri]);
          }
        },
      },
      {
        text: currentWord.library,
        onPress: async () => {
          setImageUris([]);
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            quality: 1,
          });
          if (result.cancelled) {
            setImageUris([]);
          } else {
            setImageUris([result.assets[0].uri]);
          }
        },
      },
      { text: currentWord.cancel, style: "cancel" },
    ]);
  };

  const confirmUpload = async () => {
    if (!area_id) {
      Alert.alert(currentWord.error, currentWord.noAreaSelected);
      return;
    }
    if (!defect_description) {
      Alert.alert(currentWord.error, currentWord.noDesciption);
      return;
    }
    if (imageUris.length === 0) {
      Alert.alert(currentWord.error, currentWord.noImageSelected);
      return;
    }

    const formData = new FormData();
    formData.append("pic_bef_repair", {
      uri: imageUris[0],
      type: "image/jpeg",
      name: imageUris[0].split("/").pop(),
    });

    const queryParams = new URLSearchParams({
      defect_description,
      user_id: String(user_id),
      cc_id: String(cc_id),
      area_id: String(area_id),
    }).toString();

    try {
      const response = await axios.post(
        `http://34.57.68.176:8000/add-defect?${queryParams}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        Alert.alert(currentWord.success, currentWord.imageUploaded);
        setIsAddDefectModalVisible(false);
        setImageUris([]);
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        Alert.alert(currentWord.error, currentWord.uploadFailed);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      if (error.response) {
        Alert.alert(
          currentWord.error,
          `Upload failed: ${error.response.status} ${error.response.data}`
        );
      } else if (error.request) {
        Alert.alert(currentWord.error, "No response received from server.");
      } else {
        Alert.alert(currentWord.error, error.message);
      }
    }
  };

  const cancelUpload = () => {
    setIsAddDefectModalVisible(false);
    setImageUris([]);
    setDefectDescription("");
    setAreaId(null);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.addButtonContainer}
        onPress={() => setIsAddDefectModalVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={40} color="orange" />
      </TouchableOpacity>

      {/* Upload Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isAddDefectModalVisible}
        onRequestClose={cancelUpload}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentWord.addDefect}</Text>

            <View style={styles.optionContainer}>
              {/* Replaced Picker with Dropdown */}
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={areas.map((area) => ({
                  label: area.description,
                  value: area.area_id,
                }))}
                labelField="label"
                valueField="value"
                placeholder={currentWord.selectArea}
                value={area_id}
                onChange={(item) => setAreaId(item.value)}
              />

              <TextInput
                placeholder={currentWord.defectDescription}
                style={styles.textInput}
                onChangeText={setDefectDescription}
                value={defect_description}
                placeholderTextColor="gray"
              />
            </View>

            {imageUris.length > 0 ? (
              <FlatList
                data={imageUris}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={handleImageUpload}
                    style={styles.haveImagePlaceholder}
                  >
                    <Image source={{ uri: item }} style={styles.previewImage} />
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            ) : (
              <TouchableOpacity
                onPress={handleImageUpload}
                style={styles.imagePlaceholder}
              >
                <Text style={styles.placeholderText}>
                  {currentWord.selectImage}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={confirmUpload}
              >
                <Text style={styles.modalButtonText}>
                  {currentWord.confirm}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelUpload}
              >
                <Text style={styles.cancelButtonText}>
                  {currentWord.cancel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  addButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  optionContainer: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  dropdown: {
    height: 40,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    marginBottom: 5,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "gray",
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    textAlign: "left",
    paddingHorizontal: 8,
    width: 250,
    height: 40,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  haveImagePlaceholder: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginRight: 10,
  },
  imagePlaceholder: {
    width: 300,
    height: 300,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  previewImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginRight: 5, // Space between images
  },
  placeholderText: {
    color: "gray",
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: "gray",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  modalButtonText: {
    color: "white",
    textAlign: "center",
  },
  cancelButtonText: {
    color: "white",
    textAlign: "center",
  },
  addDefectBtnContainer: {
    width: 150,
    padding: 5,
  },
  addDefectBtn: {
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    borderRadius: 120,
  },
});

export default AddDefect;
