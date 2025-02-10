import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useSelector } from "react-redux";
import words from "../../constants/words";

const UploadModal = ({
  visible,
  onClose,
  onUploadSuccess,
  selectedStatus,
  cr_id,
  user_id,
}) => {
  const API_URL = process.env.EXPO_API_URL;
  const currentLanguage = useSelector((state) => state.language.language);
  const currentWord = currentLanguage === "zh" ? words.chinese : words.english;
  const [imageUris, setImageUris] = useState([]);

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
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: "images",
            quality: 1,
          });
          if (!result.cancelled) {
            setImageUris((prev) => [...prev, result.assets[0].uri]);
          }
        },
      },
      {
        text: currentWord.library,
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsMultipleSelection: true,
            quality: 1,
          });
          if (!result.cancelled) {
            result.assets.forEach((asset) => {
              setImageUris((prev) => [...prev, asset.uri]);
            });
          }
        },
      },
      { text: currentWord.cancel, style: "cancel" },
    ]);
  };

  const confirmUpload = async () => {
    if (imageUris.length === 0) {
      Alert.alert(currentWord.error, currentWord.noImageSelected);
      return;
    }

    const formData = new FormData();
    imageUris.forEach((uri) => {
      const imageData = { uri, type: "image/png", name: uri.split("/").pop() };
      formData.append(
        selectedStatus === "order" ? "ordered_pics" : "delivered_pics",
        imageData
      );
    });

    console.log(imageUris);
    const query =
      selectedStatus === "order" ? "ordered_user_id" : "delivered_user_id";
    const link =
      selectedStatus === "order"
        ? "update-order-status"
        : "update-delivery-status";
    const url = `${API_URL}/${link}/${cr_id}?${query}=${user_id}`;
    console.log(url);

    try {
      await axios.get(`${API_URL}/`);
    } catch (error) {}

    try {
      const response = await axios.patch(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          accept: "application/json",
        },
        timeout: 20000,
      });

      if (response.status === 200) {
        Alert.alert(currentWord.success, currentWord.imageUploaded);
        onUploadSuccess(); // Callback to fetch products
        setImageUris([]);
        onClose(); // Close the modal
      } else {
        Alert.alert(currentWord.error, currentWord.uploadFailed);
      }
    } catch (error) {
      console.error("Error uploading image:", error.message);
      Alert.alert(currentWord.error, "Upload failed: " + error.message);
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {
        setImageUris([]); // Reset image URIs when closing
        onClose(); // Close the modal
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {currentWord.uploadImageFor}
            {selectedStatus === "order"
              ? currentWord.orderStatus
              : currentWord.deliveryStatus}
          </Text>
          {imageUris.length > 0 ? (
            <FlatList
              data={imageUris}
              horizontal
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.haveImagePlaceholder}>
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
              <Text style={styles.modalButtonText}>{currentWord.confirm}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setImageUris([]); // Reset image URIs when canceling
                onClose(); // Close the modal
              }}
            >
              <Text style={styles.cancelButtonText}>{currentWord.cancel}</Text>
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
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
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
    marginRight: 5,
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
});

export default UploadModal;
