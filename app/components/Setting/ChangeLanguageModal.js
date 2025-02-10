import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { useDispatch } from "react-redux";
import { Dropdown } from "react-native-element-dropdown";
import { setLanguage } from "../../../features/language/languageSlice";

const LanguageSelectionModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const handleSubmit = () => {
    dispatch(setLanguage(selectedLanguage));
    Alert.alert("Success", "Language has been changed.");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Language</Text>
          <Dropdown
            style={styles.dropdown}
            data={[
              { label: "English", value: "en" },
              { label: "中文", value: "zh" },
            ]}
            labelField="label"
            valueField="value"
            placeholder="Select Language"
            value={selectedLanguage}
            onChange={(item) => setSelectedLanguage(item.value)}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
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
    padding: 20,
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
    marginBottom: 15,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 20,
    backgroundColor: "white",
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  submitButton: {
    backgroundColor: "#f39200",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: "#d9534f",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});

export default LanguageSelectionModal;
