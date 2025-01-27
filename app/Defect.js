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
} from "react-native";
import { useSelector } from "react-redux";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";

const MyImageComponent = () => {
  const currentLanguage = useSelector((state) => state.language.language);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isDisplayModalVisible, setIsDisplayModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [imageUris, setImageUris] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false); // New loading state for images
  const cc_id = useSelector((state) => state.tabs.activeTab);
  const [cr_id, setCrId] = useState("");
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
          `http://34.57.68.176:8000/get-defect-from-category/${cc_id.key}`
        );
        console.log(response.data);
        const defectsWithImage = await Promise.all(
          response.data.defects.map(async (defect) => {
            let beforePic = null;
            let afterPic = null;

            // Fetch the image URL for each product using cm_id
            if (defect.pic_bef_repair_document) {
              beforePic = `http://34.57.68.176:8000/defect-before-repair/${defect.pic_bef_repair_document.pic_bef_repair_id}.${defect.pic_bef_repair_document.extension}`;
            }

            if (defect.pic_af_repair_document) {
              afterPic = `http://34.57.68.176:8000/defect-after-repair/${defect.pic_af_repair_document.pic_af_repair_id}.${defect.pic_af_repair_document.extension}`;
            }

            return { ...defect, beforePic, afterPic };
          })
        );
        setProducts(defectsWithImage);
      }
    } catch (error) {
      console.error("Error fetching defects:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    setProducts([]);
    fetchDefects(); // Fetch products on component mount
  }, [cc_id]);

  const openUploadModal = (status, cr_id) => {
    setCrId(cr_id);
    setSelectedStatus(status);
    setIsUploadModalVisible(true);
  };

  const openDisplayModal = async (status, cr_id) => {
    setCrId(cr_id);
    setSelectedStatus(status);
    setImagesLoading(true);
    const images = await fetchUploadedImage(status, cr_id); // Fetch images when opening the modal
    setUploadedImages(images); // Set the uploaded images in state
    setIsDisplayModalVisible(true);
    setImagesLoading(false);
  };

  const fetchUploadedImage = async (status, cr_id) => {
    try {
      const link =
        status === "order" ? "get-ordered-pic-ids" : "get-delivered-pic-ids";
      const response = await axios.get(
        `http://34.57.68.176:8000/${link}/${cr_id}`
      );
      const imageUrls =
        response.data.pic_details?.map(
          (detail) =>
            `http://34.57.68.176:8000/${
              status === "order"
                ? "ordered-status-proof"
                : "delivered-status-proof"
            }${detail.image_url}`
        ) || []; // Default to empty array if null
      return imageUrls.filter((url) => url !== null);
    } catch (error) {
      console.error("Error fetching uploaded images:", error);
      Alert.alert(currentWord.error, currentWord.imageLoadError);
      return []; // Return an empty array on error
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
          if (!result.cancelled) {
            setImageUris((prev) => [...prev, result.uri]);
          }
        },
      },
      {
        text: currentWord.library,
        onPress: async () => {
          setImageUris([]);
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsMultipleSelection: true,
            quality: 1,
          });
          if (!result.cancelled) {
            setImageUris((prev) => [
              ...prev,
              ...result.assets.map((asset) => asset.uri),
            ]);
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
      formData.append(
        selectedStatus === "order" ? "ordered_pics" : "delivered_pics",
        {
          uri,
          type: "image/jpeg",
          name: uri.split("/").pop(),
        }
      );
    });

    console.log("FormData being sent:", formData); // Log for debugging

    try {
      const query =
        selectedStatus === "order" ? "ordered_user_id" : "delivered_user_id";
      const link =
        selectedStatus === "order"
          ? "update-order-status"
          : "update-delivery-status";

      const response = await axios.patch(
        `http://34.57.68.176:8000/${link}/${cr_id}?${query}=${user_id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        Alert.alert(currentWord.success, currentWord.imageUploaded);
        setIsUploadModalVisible(false);
        setImageUris([]); // Clear images after upload
        fetchConfirmationRecord();
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
              <Text style={styles.noRecordsText}>{currentWord.none}</Text>
            </View>
          ) : (
            <ScrollView horizontal style={styles.scrollView}>
              <View>
                <View style={styles.header}>
                  <Text style={styles.headerText}>
                    {currentWord.productStatus}
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
                        {product.product_status ? (
                          <Ionicons name="square" color="green" size={20} />
                        ) : (
                          <Ionicons name="triangle" color="red" size={20} />
                        )}
                      </View>
                      <View style={styles.areaContainer}>
                        {product.beforePic ? (
                          <Image
                            source={{ uri: product.beforePic || null }}
                            style={styles.productImage}
                          />
                        ) : (
                          <View style={styles.noImage}>
                            <Text tyle={styles.productStatus}>+</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.areaContainer}>
                        {product.afterPic ? (
                          <Image
                            source={{ uri: product.afterPic || null }}
                            style={styles.productImage}
                          />
                        ) : (
                          <View style={styles.noImage}>
                            <Text tyle={styles.productStatus}>+</Text>
                          </View>
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

      {/* Display Modal */}
      {imagesLoading ? (
        <ActivityIndicator
          size="large"
          color="orange"
          style={styles.loadingIndicator}
        />
      ) : (
        <Modal
          transparent={true}
          animationType="fade"
          visible={isDisplayModalVisible}
          onRequestClose={() => setIsDisplayModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {currentWord.uploadedImageFor}
                {selectedStatus === "order"
                  ? currentWord.orderStatus
                  : currentWord.deliveryStatus}
              </Text>

              <FlatList
                data={uploadedImages}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.haveImagePlaceholder}>
                    <Image source={{ uri: item }} style={styles.previewImage} />
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsDisplayModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>
                    {currentWord.close}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
});

const words = {
  english: {
    none: "There are no Variable Orders available.",
    productStatus: "Product Status",
    beforePic: "Before Picture",
    afterPic: "After Picture",
    productDescription: "Product Description",
    orderStatus: "Order Status",
    deliveryStatus: "Delivery Status",
    defectDescription: "Defect Description",
    uploadImageFor: "Upload Image for ",
    uploadedImageFor: "Uploaded Image for ",
    selectPhoto: "Select a photo from the library or take a new photo",
    chooseOption: "Choose an option",
    camera: "Camera",
    library: "Library",
    cancel: "Cancel",
    close: "Close",
    error: "Error",
    noImageSelected: "No image selected.",
    success: "Success",
    imageUploaded: "Image uploaded successfully!",
    uploadFailed: "Failed to upload image.",
    cameraPermissionError:
      "Sorry, we need camera permissions to make this work!",
    mediaLibraryPermissionError:
      "Sorry, we need media library permissions to make this work!",
    selectImage: "Select Image",
    confirm: "Confirm",
    imageLoadError: "An error occurred while loading images.", // New error message
  },
  chinese: {
    none: "冇可用嘅可變訂單.",
    productStatus: "產品狀態",
    beforePic: "喺圖片之前",
    afterPic: "圖片之後",
    productDescription: "產品描述",
    orderStatus: "訂單狀態",
    deliveryStatus: "送貨狀態",
    defectDescription: "缺陷描述",
    uploadImageFor: "上傳圖片以便",
    uploadedImageFor: "上載咗嘅圖片",
    selectPhoto: "選擇照片或拍攝新照片",
    chooseOption: "選擇一個選項",
    camera: "相機",
    library: "相簿",
    cancel: "取消",
    close: "閂",
    error: "錯誤",
    noImageSelected: "未選擇圖片。",
    success: "成功",
    imageUploaded: "圖片上傳成功！",
    uploadFailed: "圖片上傳失敗。",
    cameraPermissionError: "抱歉，我們需要相機權限來使其正常工作！",
    mediaLibraryPermissionError: "抱歉，我們需要媒體庫權限來使其正常工作！",
    selectImage: "選擇圖片",
    confirm: "確認",
    imageLoadError: "加載圖片時出現錯誤。", // New error message
  },
};

export default MyImageComponent;
