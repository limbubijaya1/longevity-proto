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
import words from "../constants/words";
import UploadImageModal from "./UploadImageModal";

const ConfirmationRecord = () => {
  const currentLanguage = useSelector((state) => state.language.language);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isDisplayModalVisible, setIsDisplayModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false); // New loading state for images
  const cc_id = useSelector((state) => state.tabs.activeTab);
  const [cr_id, setCrId] = useState("");
  const [user_id, setUserId] = useState("");
  const currentWord = currentLanguage === "zh" ? words.chinese : words.english;

  const fetchConfirmationRecord = async () => {
    setLoading(true);
    try {
      const storedUserId = await AsyncStorage.getItem("user_id");
      setUserId(storedUserId);
      if (storedUserId) {
        const response = await axios.get(
          `http://34.57.68.176:8000/confirmed-products/${cc_id.key}`
        );
        const productsWithImages = await Promise.all(
          response.data.map(async (product) => {
            try {
              const imageResponse = await axios.get(
                `http://34.57.68.176:8000/get-candidate-material-pic/${product.cm_id}`
              );
              const picUrl = imageResponse.data?.image_url
                ? `http://34.57.68.176:8000/candidate-material-pic${imageResponse.data.image_url}`
                : null;
              return { ...product, picUrl };
            } catch (imageError) {
              console.error(
                `Error fetching image for cm_id ${product.cm_id}:`,
                imageError
              );
              return { ...product, picUrl: null };
            }
          })
        );
        setProducts(productsWithImages);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfirmationRecord();
  }, [cc_id]);

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

      const imageUrls = await Promise.all(
        response.data.pic_details.map(async (detail) => {
          try {
            const imageUrl = `http://34.57.68.176:8000/${
              status === "order"
                ? "ordered-status-proof"
                : "delivered-status-proof"
            }${detail.image_url}`;
            return imageUrl;
          } catch (error) {
            console.error("Error fetching image URL:", error);
            return null; // Return null if there's an error fetching the image URL
          }
        })
      );
      return imageUrls.filter((url) => url !== null);
    } catch (error) {
      console.error("Error getting uploaded status image:", error);
      Alert.alert(
        currentWord.error,
        currentWord.imageLoadError // Use translated text
      );
      return []; // Return an empty array on error
    }
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
                  <Text style={styles.headerText}>{currentWord.photo}</Text>
                  <Text style={styles.headerText}>
                    {currentWord.productDescription}
                  </Text>
                  <Text style={styles.headerText}>{currentWord.quantity}</Text>
                  <Text style={styles.headerText}>
                    {currentWord.orderStatus}
                  </Text>
                  <Text style={styles.headerText}>
                    {currentWord.deliveryStatus}
                  </Text>
                </View>
                <View
                  style={
                    currentLanguage === "zh"
                      ? styles.chinSubHeader
                      : styles.enSubHeader
                  }
                ></View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {products.map((product) => (
                    <View style={styles.itemContainer} key={product.cr_id}>
                      <View style={styles.areaContainer}>
                        {product.product_status ? (
                          <Ionicons name="square" color="green" size={20} />
                        ) : (
                          <Ionicons name="triangle" color="red" size={20} />
                        )}
                      </View>
                      <View style={styles.imageContainer}>
                        <Image
                          source={{ uri: product.picUrl }}
                          style={styles.productImage}
                        />
                      </View>
                      <View style={styles.productDescriptionContainer}>
                        <Text style={styles.productCode}>
                          {product.product_no}
                        </Text>
                        <Text style={styles.productDescription}>
                          {product.spec}
                        </Text>
                      </View>
                      <View style={styles.priceContainer}>
                        <Text style={styles.productStatus}>
                          {product.quantity}
                        </Text>
                      </View>
                      <View style={styles.specContainer}>
                        <TouchableOpacity
                          onPress={() =>
                            !product.order_status
                              ? setIsUploadModalVisible(
                                  true,
                                  setSelectedStatus("order"),
                                  setCrId(product.cr_id)
                                )
                              : openDisplayModal("order", product.cr_id)
                          }
                        >
                          {product.order_status ? (
                            <Ionicons name="square" color="green" size={20} />
                          ) : (
                            <Ionicons name="triangle" color="red" size={20} />
                          )}
                        </TouchableOpacity>
                      </View>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity
                          onPress={() =>
                            !product.delivery_status
                              ? setIsUploadModalVisible(
                                  true,
                                  setSelectedStatus("delivery"),
                                  setCrId(product.cr_id)
                                )
                              : openDisplayModal("delivery", product.cr_id)
                          }
                        >
                          {product.delivery_status ? (
                            <Ionicons name="square" color="green" size={20} />
                          ) : (
                            <Ionicons name="triangle" color="red" size={20} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
          )}
        </>
      )}

      <UploadImageModal
        visible={isUploadModalVisible}
        onClose={() => setIsUploadModalVisible(false)}
        onUploadSuccess={fetchConfirmationRecord}
        selectedStatus={selectedStatus}
        cr_id={cr_id}
        user_id={user_id}
      />

      {/* Display Modal */}
      {imagesLoading ? ( // Show loading indicator
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
    height: "100%",
  },
  noRecordsText: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 5,
    borderBottomWidth: 1,
    alignItems: "center",
    borderColor: "#eed774",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  chinSubHeader: {
    marginBottom: 25,
  },
  enSubHeader: {
    marginBottom: 50,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 15,
    flex: 1,
    textAlign: "center",
    minWidth: 100,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eed774",
    minWidth: 600,
  },
  areaContainer: {
    flex: 1,
    alignItems: "center",
    width: 100,
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
    width: 100,
  },
  productDescriptionContainer: {
    flex: 1,
    alignItems: "center",
    width: 100,
  },
  priceContainer: {
    flex: 1,
    alignItems: "center",
    width: 100,
  },
  specContainer: {
    flex: 1,
    alignItems: "center",
    width: 100,
  },
  quantityContainer: {
    flex: 1,
    alignItems: "center",
    width: 100,
  },
  productImage: {
    width: 60,
    height: 60,
    resizeMode: "cover",
    borderRadius: 12,
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
  productStatus: {
    fontSize: 12,
    color: "gray",
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

export default ConfirmationRecord;
