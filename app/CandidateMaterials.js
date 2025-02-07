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
import words from "../constants/words";

const ProductList = () => {
  const currentLanguage = useSelector((state) => state.language.language);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Option 1");
  const cc_id = useSelector((state) => state.tabs.activeTab);

  const currentWord = currentLanguage === "zh" ? words.chinese : words.english;

  useEffect(() => {
    fetchCandidateMaterials(); // Fetch products on component mount
  }, [cc_id]);

  const fetchCandidateMaterials = async () => {
    setLoading(true);
    try {
      const storedUserId = await AsyncStorage.getItem("user_id");

      if (storedUserId) {
        const response = await axios.get(
          `http://34.57.68.176:8000/get-candidate-materials`
        );

        const updatedProducts = response.data.map((product) => {
          const picUrl = `http://34.57.68.176:8000/candidate-material-pic/${product.pic_document.cm_pic_id}.${product.pic_document.extension}`;
          return {
            ...product,
            picUrl, // Add the new image URL
          };
        });
        setProducts(updatedProducts);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  const toggleCheckbox = (cm_id) => {
    setSelectedProducts((prevSelected) => {
      const newSelected = { ...prevSelected };
      if (newSelected[cm_id]) {
        delete newSelected[cm_id]; // Unselect the product
      } else {
        newSelected[cm_id] = 1; // Select the product with a quantity of 1
      }
      return newSelected;
    });
  };

  const handleQuantityChange = (cm_id, value) => {
    if (/^\d*$/.test(value)) {
      const newValue = value === "" ? "" : Math.max(1, parseInt(value)); // Ensure quantity is at least 1
      setSelectedProducts((prevSelected) => ({
        ...prevSelected,
        [cm_id]: newValue,
      }));
    }
  };

  const showModal = () => {
    const selected = Object.keys(selectedProducts).filter(
      (cm_id) => selectedProducts[cm_id] > 0
    );
    const allQuantitiesValid = selected.every(
      (cm_id) => selectedProducts[cm_id] > 0
    );
    if (selected.length > 0 && allQuantitiesValid) {
      setIsModalVisible(true);
    } else {
      Alert.alert(currentWord.errorNoSelect, currentWord.errorNoSelect1);
    }
  };

  const handleConfirm = async () => {
    const selected = Object.keys(selectedProducts).filter(
      (cm_id) => selectedProducts[cm_id] > 0
    );

    if (selected.length > 0) {
      const productData = selected.map((cm_id) => ({
        cm_id,
        quantity: selectedProducts[cm_id], // Get the quantity from the combined state
        cc_id: cc_id.key,
      }));

      const postUserId = await AsyncStorage.getItem("user_id");
      const requestBody = {
        product: productData,
        post_user_id: postUserId,
        variable_order: selectedOption === "Option 2",
        order_type: selectedOption === "Option 1",
      };

      try {
        const response = await axios.post(
          "http://34.57.68.176:8000/select-product",
          requestBody
        );
        if (response.status === 200) {
          Alert.alert(currentWord.success, currentWord.successCandidate);
        } else {
          Alert.alert(currentWord.error, currentWord.errorCandidate);
        }
      } catch (error) {
        console.error("Error selecting products:", error);
        Alert.alert("Error", "An error occurred while selecting products.");
      } finally {
        setIsModalVisible(false);
      }
    } else {
      Alert.alert(currentWord.errorNoSelect, currentWord.errorNoSelect2);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {loading ? ( // Conditional rendering based on loading state
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="orange" />
        </View>
      ) : (
        <>
          <Modal
            animationType="fade"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => {
              setIsModalVisible(!isModalVisible);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{currentWord.modalTitle}</Text>
                <View>
                  <Pressable onPress={() => setSelectedOption("Option 1")}>
                    <Text
                      style={
                        selectedOption === "Option 1"
                          ? styles.selectedOption
                          : styles.option
                      }
                    >
                      {currentWord.modalOption1}
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
                      {currentWord.modalOption2}
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.buttonContainer}>
                  <Pressable
                    style={styles.confirmButton}
                    onPress={handleConfirm}
                  >
                    <Text style={styles.confirmButtonText}>
                      {currentWord.confirm}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>
                      {currentWord.cancel}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          <View style={styles.scrollView}>
            <ScrollView horizontal>
              <View>
                <View style={styles.header}>
                  <Text style={styles.headerText}>{currentWord.area}</Text>
                  <Text style={styles.headerText}>{currentWord.photo}</Text>
                  <Text style={styles.headerText}>{currentWord.productNo}</Text>
                  <Text style={styles.headerText}>{currentWord.price}</Text>
                  <Text style={styles.headerText}>{currentWord.spec}</Text>
                  <Text style={styles.headerText}>{currentWord.quantity}</Text>
                </View>
                <View style={styles.subHeader}></View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {products.map((product) => (
                    <View style={styles.itemContainer} key={product.cm_id}>
                      <View style={styles.selectContainer}>
                        <TouchableOpacity
                          style={[
                            styles.checkbox,
                            selectedProducts[product.cm_id] &&
                              styles.checkboxChecked,
                          ]}
                          onPress={() => toggleCheckbox(product.cm_id)}
                        />
                      </View>
                      <View style={styles.areaContainer}>
                        <Text style={styles.productStatus}>{product.area}</Text>
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
                      </View>
                      <View style={styles.priceContainer}>
                        <Text style={styles.productStatus}>
                          {product.price}
                        </Text>
                      </View>
                      <View style={styles.specContainer}>
                        <Text style={styles.productDescription}>
                          {product.spec}
                        </Text>
                      </View>
                      <View style={styles.quantityContainer}>
                        <TextInput
                          style={styles.quantityInput}
                          keyboardType="numeric"
                          value={
                            selectedProducts[product.cm_id] !== undefined
                              ? selectedProducts[product.cm_id].toString()
                              : ""
                          }
                          onChangeText={(value) =>
                            handleQuantityChange(product.cm_id, value)
                          }
                          placeholder="0"
                          placeholderTextColor="gray"
                        />
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.confirmButtonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={showModal}
              >
                <Text style={styles.confirmButtonText}>
                  {currentWord.confirm}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
    paddingBottom: 0,
    width: "100%",
    height: "100%",
    borderWidth: 0,
  },
  scrollView: {
    borderRadius: 20,
    padding: 10,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderColor: "#eed774",
    paddingLeft: 40,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  subHeader: {
    marginBottom: 30,
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
    paddingLeft: 40,
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
    marginTop: 10,
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

export default ProductList;
