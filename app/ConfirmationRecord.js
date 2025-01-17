import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import axios from "axios";
import { useSelector } from "react-redux";
import Ionicons from "react-native-vector-icons/Ionicons";

const ConfirmationRecord = () => {
  const [selectedProducts, setSelectedProducts] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const cc_id = useSelector((state) => state.tabs.activeTab);

  const fetchConfirmationRecord = async () => {
    setLoading(true);
    try {
      const storedUserId = await AsyncStorage.getItem("user_id");

      if (storedUserId) {
        const response = await axios.get(
          `http://34.57.68.176:8000/confirmed-products/${cc_id.key}`
        );
        const productsWithImages = await Promise.all(
          response.data.map(async (product) => {
            try {
              // Fetch the image URL for each product using cm_id
              const imageResponse = await axios.get(
                `http://34.57.68.176:8000/get-candidate-material-pic/${product.cm_id}`
              );

              // Check if imageResponse contains valid data
              if (imageResponse.data && imageResponse.data.image_url) {
                const picUrl = `http://34.57.68.176:8000/candidate-material-pic${imageResponse.data.image_url}`;
                // Return the product object with the image URL
                return {
                  ...product,
                  picUrl, // Add the new image URL
                };
              } else {
                console.error(`No image URL found for cm_id: ${product.cm_id}`);
                return {
                  ...product,
                  picUrl: null, // Set a default or null if no image is found
                };
              }
            } catch (imageError) {
              console.error(
                `Error fetching image for cm_id ${product.cm_id}:`,
                imageError
              );
              return {
                ...product,
                picUrl: null, // Handle image fetch errors
              };
            }
          })
        );
        console.log(productsWithImages);
        setProducts(productsWithImages);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    fetchConfirmationRecord(); // Fetch products on component mount
  }, [cc_id]);

  // const showModal = () => {
  //   const selected = Object.keys(selectedProducts).filter(
  //     (cm_id) => selectedProducts[cm_id] > 0
  //   );
  //   const allQuantitiesValid = selected.every(
  //     (cm_id) => selectedProducts[cm_id] > 0
  //   );
  //   if (selected.length > 0 && allQuantitiesValid) {
  //     setIsModalVisible(true);
  //   } else {
  //     Alert.alert(
  //       "Invalid Selection",
  //       "Please select at least one product with a quantity."
  //     );
  //   }
  // };

  // const handleConfirm = async () => {
  //   const selected = Object.keys(selectedProducts).filter(
  //     (cm_id) => selectedProducts[cm_id] > 0
  //   );

  //   if (selected.length > 0) {
  //     const productData = selected.map((cm_id) => ({
  //       cm_id,
  //       quantity: selectedProducts[cm_id], // Get the quantity from the combined state
  //       cc_id: cc_id.key,
  //     }));

  //     const postUserId = await AsyncStorage.getItem("user_id");
  //     const requestBody = {
  //       product: productData,
  //       post_user_id: postUserId,
  //       variable_order: selectedOption === "Option 2",
  //       order_type: selectedOption === "Option 1",
  //     };

  //     try {
  //       const response = await axios.post(
  //         "http://34.57.68.176:8000/select-product",
  //         requestBody
  //       );
  //       if (response.status === 200) {
  //         Alert.alert("Success", "Products selected successfully!");
  //       } else {
  //         Alert.alert("Error", "Failed to select products.");
  //       }
  //     } catch (error) {
  //       console.error("Error selecting products:", error);
  //       Alert.alert("Error", "An error occurred while selecting products.");
  //     } finally {
  //       setIsModalVisible(false);
  //     }
  //   } else {
  //     Alert.alert(
  //       "No Products Selected",
  //       "Please select at least one product with a quantity."
  //     );
  //   }
  // };

  return (
    <View style={styles.mainContainer}>
      {loading ? ( // Conditional rendering based on loading state
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="orange" />
        </View>
      ) : (
        <>
          {/* <Modal
            animationType="fade"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => {
              setIsModalVisible(!isModalVisible);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select an Order Option</Text>
                <View>
                  <Pressable onPress={() => setSelectedOption("Option 1")}>
                    <Text
                      style={
                        selectedOption === "Option 1"
                          ? styles.selectedOption
                          : styles.option
                      }
                    >
                      Confirmation Order
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => setSelectedOption("Option 2")}>
                    <Text
                      style={
                        selectedOption === "Option 2"
                          ? styles.selectedOption
                          : styles.option
                      }
                    >
                      Variable Order
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.buttonContainer}>
                  <Pressable
                    style={styles.confirmButton}
                    onPress={handleConfirm}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </Pressable>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal> */}

          <ScrollView horizontal>
            <View>
              <View style={styles.header}>
                <Text style={styles.headerText}>Product Status</Text>
                <Text style={styles.headerText}>Photo</Text>
                <Text style={styles.headerText}>Product Description</Text>
                <Text style={styles.headerText}>Quantity</Text>
                <Text style={styles.headerText}>Order Status</Text>
                <Text style={styles.headerText}>Delivery Status</Text>
              </View>
              <View style={styles.subHeader}></View>
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
                        source={{
                          uri: product.picUrl,
                        }}
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
                      {product.order_status ? (
                        <Ionicons name="square" color="green" size={20} />
                      ) : (
                        <Ionicons name="triangle" color="red" size={20} />
                      )}
                    </View>
                    <View style={styles.quantityContainer}>
                      {product.delivery_status ? (
                        <Ionicons name="square" color="green" size={20} />
                      ) : (
                        <Ionicons name="triangle" color="red" size={20} />
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </>
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
  mainContainer: {
    padding: 10,
    paddingBottom: 0,
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
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
  subHeader: {
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
  checkbox: {
    width: 25,
    height: 25,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    backgroundColor: "white",
    marginRight: 40,
  },
  checkboxChecked: {
    borderColor: "white",
    backgroundColor: "orange", // Change color to indicate checked state
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
  quantityInput: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 5,
    width: 50,
    height: 45,
    textAlign: "center",
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
  selectContainer: {
    flex: 1,
    alignItems: "center",
    width: 0,
  },
  confirmButtonContainer: {
    alignItems: "center",
    borderTopWidth: 0,
    borderColor: "orange",
    marginTop: 0,
    padding: 5,
  },
  confirmButton: {
    backgroundColor: "orange",
    paddingHorizontal: 10,
    width: 120,
    height: 40,
    borderRadius: 25,
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  modalContainer: {
    //modal
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
    marginBottom: 20,
  },
  option: {
    fontSize: 16,
    padding: 10,
  },
  selectedOption: {
    fontSize: 16,
    padding: 10,
    backgroundColor: "#e0e0e0", // Highlight selected option
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "gray",
    width: 120,
    height: 40,
    borderRadius: 25,
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  cancelButtonText: {
    color: "#fff",
    textAlign: "center",
  },
});

export default ConfirmationRecord;
