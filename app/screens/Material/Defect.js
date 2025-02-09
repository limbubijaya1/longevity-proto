import axios from "axios";
import { API_URL } from "@env";
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
} from "react-native";
import { useSelector } from "react-redux";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import AddDefect from "../../components/AddDefect";
import words from "../../../constants/words";

const Defects = () => {
  const currentLanguage = useSelector((state) => state.language.language);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [imageUris, setImageUris] = useState([]);
  const cc_id = useSelector((state) => state.tabs.activeTab);
  const [defect_id, setDefectId] = useState("");
  const [user_id, setUserId] = useState("");
  const currentWord = currentLanguage === "zh" ? words.chinese : words.english;

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== "granted") {
      Alert.alert(currentWord.error, currentWord.cameraPermissionError); // Multilingual alert
    }

    const mediaLibraryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaLibraryPermission.status !== "granted") {
      Alert.alert(currentWord.error, currentWord.mediaLibraryPermissionError); // Multilingual alert
    }
  };

  const fetchDefects = async () => {
    setLoading(true);
    try {
      const storedUserId = await AsyncStorage.getItem("user_id");
      setUserId(storedUserId);
      if (storedUserId) {
        const response = await axios.get(
          `${API_URL}/get-defect-from-category/${cc_id.key}`
        );

        console.log(response.data); // Log the response

        if (response.status === 200) {
          const defectsWithImage = await Promise.all(
            (response.data.defects || []).map(async (defect) => {
              let beforePic = null;
              let afterPic = null;

              if (defect.pic_bef_repair_document) {
                beforePic = `${API_URL}/defect-before-repair/${defect.pic_bef_repair_document.pic_bef_repair_id}.${defect.pic_bef_repair_document.extension}`;
              }

              if (defect.pic_af_repair_document) {
                afterPic = `${API_URL}/defect-after-repair/${defect.pic_af_repair_document.pic_af_repair_id}.${defect.pic_af_repair_document.extension}`;
              }

              return { ...defect, beforePic, afterPic };
            })
          );
          setProducts(defectsWithImage);
        } else {
          Alert.alert(currentWord.error, "Failed to fetch defects");
        }
      }
    } catch (error) {
      console.error("Error fetching defects:", error);
      Alert.alert(
        currentWord.error,
        "An error occurred while fetching defects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setProducts([]);
    fetchDefects(); // Fetch products on component mount
  }, [cc_id]);

  const openUploadModal = (defect_id) => {
    setDefectId(defect_id);
    setIsUploadModalVisible(true);
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
            setImageUris([]); // Clear images if cancelled
          } else {
            setImageUris([result.assets[0].uri]); // Only set the selected image
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
            setImageUris([]); // Clear images if cancelled
          } else {
            setImageUris([result.assets[0].uri]); // Only set the first selected image
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
    formData.append("pic_af_repair", {
      uri: imageUris[0], // Use the first image only
      type: "image/jpeg",
      name: imageUris[0].split("/").pop(),
    });

    const queryParams = new URLSearchParams({
      user_id: String(user_id), // Convert to string
    }).toString();

    console.log("FormData being sent:", formData); // Log for debugging
    try {
      await axios.get("${API_URL}/");
    } catch (error) {}

    try {
      const response = await axios.patch(
        `${API_URL}/update-defect-completion-status/${defect_id}?${queryParams}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        Alert.alert(currentWord.success, currentWord.imageUploaded);
        setIsUploadModalVisible(false);
        setImageUris([]); // Clear images after upload
        fetchDefects();
      } else {
        Alert.alert(currentWord.error, currentWord.uploadFailed);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      if (error.response) {
        // Request was made and server responded with a status code
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        Alert.alert(
          currentWord.error,
          `Upload failed: ${error.response.status} ${error.response.data}`
        );
      } else if (error.request) {
        // Request was made but no response was received
        console.error("Request data:", error.request);
        Alert.alert(currentWord.error, "No response received from server.");
      } else {
        // Something happened in setting up the request
        console.error("Error message:", error.message);
        Alert.alert(currentWord.error, error.message);
      }
    }
  };

  const cancelUpload = () => {
    setIsUploadModalVisible(false);
    setImageUris([]); // Clear images on cancel
  };

  return (
    <View style={styles.mainContainer}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="orange" />
        </View>
      ) : (
        <>
          {products.length === 0 ? (
            <View>
              <Text style={styles.noRecordsText}>
                {currentWord.noneDefects}
              </Text>
            </View>
          ) : (
            <ScrollView horizontal style={styles.scrollView}>
              <View>
                <View style={styles.header}>
                  <Text style={styles.headerText}>
                    {currentWord.defectStatus}
                  </Text>
                  <Text style={styles.headerText} numberOfLines={2}>
                    {currentWord.beforePic}
                  </Text>
                  <Text style={styles.headerText} numberOfLines={2}>
                    {currentWord.afterPic}
                  </Text>
                  <Text style={styles.headerText} numberOfLines={2}>
                    {currentWord.defectDescription}
                  </Text>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {products.map((product) => (
                    <View style={styles.itemContainer} key={product.defect_id}>
                      <View style={styles.areaContainer}>
                        {product.pic_af_repair_document ? (
                          <Ionicons name="square" color="green" size={20} />
                        ) : (
                          <Ionicons name="triangle" color="red" size={20} />
                        )}
                      </View>
                      <View style={styles.areaContainer}>
                        <Image
                          source={{ uri: product.beforePic || null }}
                          style={styles.productImage}
                        />
                      </View>
                      <View style={styles.areaContainer}>
                        {product.afterPic ? (
                          <Image
                            source={{ uri: product.afterPic || null }}
                            style={styles.productImage}
                          />
                        ) : (
                          <TouchableOpacity
                            onPress={() => openUploadModal(product.defect_id)}
                          >
                            <View style={styles.noImage}>
                              <Text tyle={styles.productStatus}>+</Text>
                            </View>
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={styles.areaContainer}>
                        <Text style={styles.productStatus}>
                          {product.defect_description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
          )}
          <View style={styles.addDefectBtnContainer}>
            <AddDefect onUploadSuccess={fetchDefects} />
          </View>
        </>
      )}

      {/* Upload Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isUploadModalVisible}
        onRequestClose={cancelUpload}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentWord.modalTitle}</Text>

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingIndicator: {
    position: "absolute",
    top: "45%",
    left: "45%",
  },
  scrollView: {
    borderRadius: 20,
    padding: 10,
    backgroundColor: "#fff",
  },
  mainContainer: {
    paddingBottom: 0,
    width: "100%",
    height: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5, // Match itemContainer padding
    borderBottomWidth: 1,
    borderColor: "#eed774",
    paddingHorizontal: 20,
    width: "100%",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 15,
    flex: 1,
    width: 120,
    textAlign: "center",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10, // Match header padding
    borderBottomWidth: 1,
    borderBottomColor: "#eed774",
    paddingHorizontal: 20,
    width: "100%", // Ensure width matches
  },
  areaContainer: {
    flex: 1, // Adjusted for better alignment
    alignItems: "center",
    width: 120,
  },
  productImage: {
    width: 80,
    height: 80,
    resizeMode: "cover",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  noImage: {
    width: 80,
    height: 80,
    resizeMode: "cover",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productStatus: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
  },
  noRecordsText: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
    padding: 20,
  },

  chinSubHeader: {
    marginBottom: 25,
  },
  enSubHeader: {
    marginBottom: 50,
  },
  productCode: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
  },
  productDescription: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
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
    top: 355,
    left: 20,
    position: "absolute",
  },
  addDefectBtn: {
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    borderRadius: 120,
  },
});

export default Defects;
