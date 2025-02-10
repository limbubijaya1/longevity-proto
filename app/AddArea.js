import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import axios from "axios";
import { useSelector } from "react-redux";

const AddArea = ({ modalVisible, setModalVisible, fetchAreas }) => {
  const [areaDescription, setAreaDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const project_id = useSelector((state) => state.project.project.project_id);

  const handleSubmit = async () => {
    if (!areaDescription) {
      setErrorMessage("Area description is required.");
      return;
    }

    try {
      await axios.post("http://34.57.68.176:8000/add-area-description", {
        description: areaDescription,
        project_id: project_id,
      });

      setAreaDescription("");
      setErrorMessage("");
      setModalVisible(false);
      fetchAreas(); // Refresh the area list
    } catch (error) {
      console.error("Error adding area:", error);
      setErrorMessage("Failed to add area.");
    }
  };

  return (
    <Modal transparent={true} animationType="fade" visible={modalVisible}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Area</Text>
          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : null}
          <TextInput
            style={styles.textInput}
            placeholder="Enter area description"
            value={areaDescription}
            onChangeText={setAreaDescription}
            placeholderTextColor="gray"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handleSubmit}>
              <Text style={styles.modalButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    width: "100%",
    height: 40,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: "red",
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
  errorMessage: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default AddArea;
