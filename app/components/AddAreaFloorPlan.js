import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import { useSelector } from "react-redux";

const AddAreaFloorPlan = ({
  modalVisible,
  setModalVisible,
  areaId,
  fetchCurrentAreaFiles,
}) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const [floorPlanName, setFloorPlanName] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const user_id = useSelector((state) => state.user.userId);

  const handleUpload = async () => {
    if (!areaId || !floorPlanName || !pdfFile) {
      alert("Please fill all fields.");
      return;
    }

    const formData = new FormData();

    formData.append("ap", {
      uri: pdfFile.uri,
      type: pdfFile.mimeType,
      name: pdfFile.name,
    });

    console.log(formData._parts[0][1]);

    const url = `${API_URL}/add-floor-plan/${encodeURIComponent(
      areaId
    )}?floor_plan_name=${encodeURIComponent(
      floorPlanName
    )}&user_id=${encodeURIComponent(user_id)}`;

    try {
      console.log(url);
      await axios.patch(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Floor plan uploaded successfully.");
      fetchCurrentAreaFiles(areaId); // Fetch files for the current area
      setModalVisible(false);
    } catch (error) {
      console.error("Error uploading floor plan:", error);
      alert("Error uploading floor plan");
    }
  };

  const handleFileSelect = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });
      if (!res.canceled) {
        const selectedFile = res.assets[0];
        setPdfFile(selectedFile);
      }
    } catch (err) {
      console.error("Error picking document:", err);
    }
  };

  return (
    <Modal visible={modalVisible} animationType="fade">
      <View style={styles.container}>
        <Text style={styles.title}>Add Floor Plan</Text>

        <TextInput
          style={styles.input}
          placeholder="Floor Plan Name"
          value={floorPlanName}
          onChangeText={setFloorPlanName}
          placeholderTextColor="gray"
        />

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleFileSelect}
        >
          <Text style={styles.uploadButtonText}>
            {pdfFile ? pdfFile.name : "Upload PDF"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleUpload}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setModalVisible(false)}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  uploadButton: {
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default AddAreaFloorPlan;
