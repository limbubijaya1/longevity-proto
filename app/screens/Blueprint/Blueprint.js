import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Modal,
} from "react-native";
import axios from "axios";
import { API_URL } from "@env";
import { useSelector } from "react-redux";
import PdfViewer from "../../components/PdfViewer"; // Import the PdfViewer component

const Blueprint = () => {
  const [areas, setAreas] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedArea, setSelectedArea] = useState("Main");
  const [showAreaList, setShowAreaList] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPdfUri, setSelectedPdfUri] = useState(null);
  const project_id = useSelector((state) => state.project.project.project_id);
  const floorPlan = useSelector(
    (state) => state.project.project.floor_plan_documents
  );

  // Fetch areas from API
  const fetchAreas = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/all-area-descriptions-of-one-project/${project_id}`
      );
      setAreas(response.data.area_descriptions);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  const fetchFloorPlans = () => {
    const updatedFiles = floorPlan.map((plan) => {
      const { floor_plan_id, extension, name } = plan;
      return {
        uri: `${API_URL}/main-floor-plan/${floor_plan_id}.${extension}`,
        name: name,
        content_type: plan.content_type,
      };
    });
    setFiles(updatedFiles);
  };

  const fetchCurrentAreaFiles = async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/get-floor-plan-id-from-area/${id}`
      );

      if (response.data.pic_details.length === 0) {
        setErrorMessage("No active floor plans found for this area");
        setFiles([]);
      } else {
        const areaFiles = response.data.pic_details.map((item) => ({
          uri: `${API_URL}/area-floor-plan${item.image_url}`,
          name: item.floor_plan_name,
          content_type: item.content_type,
        }));
        setFiles(areaFiles);
        setErrorMessage("");
      }
    } catch (error) {
      if (error.response && error.response.status === 500) {
        setErrorMessage("No active floor plans found for this area");
      } else {
        console.error("Error fetching files:", error);
      }
      setFiles([]);
    }
  };

  const handleAddArea = () => {
    console.log("Add Area button pressed");
    // Logic to add area goes here (e.g., open a modal)
  };

  useEffect(() => {
    fetchAreas();
    fetchFloorPlans(); // Fetch floor plans on component mount
  }, []);

  const handlePdfClick = (uri) => {
    setSelectedPdfUri(uri);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Title Area */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>總施工圖</Text>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {/* Left Side Navigation */}
        <View style={styles.leftSide}>
          <View
            style={[
              styles.mainAreaBtnContainer,
              selectedArea === "Main" && styles.activeAreaItem,
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                setFiles([]); // Clear previous files
                setErrorMessage(""); // Clear error message
                setSelectedArea("Main"); // Set selected area to Main
                setShowAreaList(false); // Hide area list
                fetchFloorPlans(); // Fetch floor plans when Main is pressed
              }}
            >
              <Text style={styles.mainAreaBtnText}>Main</Text>
            </TouchableOpacity>
          </View>

          {/* Area Selection Button */}
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              selectedArea === "Area" && styles.activeAreaItem,
            ]}
            onPress={() => {
              setFiles([]); // Clear previous files
              setErrorMessage(""); // Clear error message
              setShowAreaList(!showAreaList); // Toggle area list visibility
              setSelectedArea("Area"); // Set selected area to Area
            }}
          >
            <Text style={styles.dropdownButtonText}>Area</Text>
          </TouchableOpacity>

          {/* Area List */}
          {showAreaList && (
            <FlatList
              data={areas}
              keyExtractor={(item) => item.area_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.areaItem,
                    selectedArea === item.description && styles.activeAreaItem,
                  ]}
                  onPress={() => {
                    setSelectedArea(item.description);
                    fetchCurrentAreaFiles(item.area_id);
                  }}
                >
                  <Text>{item.description}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Button Container */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleAddArea}>
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Side PDF Display */}
        <View style={styles.pdfContainer}>
          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : (
            <FlatList
              data={files}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handlePdfClick(item.uri)}>
                  <View style={styles.pdfItem}>
                    <Image source={{ uri: item.uri }} style={styles.pdfIcon} />
                    <Text>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              )}
              numColumns={2}
            />
          )}
        </View>
      </View>

      {/* PDF Viewer Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <PdfViewer uri={selectedPdfUri} />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setModalVisible(false)}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "92%",
    paddingVertical: 10,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flexDirection: "row",
    backgroundColor: "white",
    flex: 1,
    borderRadius: 15,
    padding: 5,
  },
  leftSide: {
    width: "30%",
    alignItems: "center",
    backgroundColor: "white",
    borderRightWidth: 2,
    borderRightColor: "rgb(198, 196, 196)",
  },
  mainAreaBtnContainer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    borderBottomColor: "rgb(198, 196, 196)",
    borderTopStartRadius: 15,
    borderBottomWidth: 1,
  },
  mainAreaBtnText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dropdownButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    borderBottomColor: "rgb(198, 196, 196)",
    borderBottomWidth: 1,
  },
  dropdownButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  areaItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgb(198, 196, 196)",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  activeAreaItem: {
    backgroundColor: "rgba(0, 0, 0, 0.11)",
  },
  buttonContainer: {
    padding: 10,
    width: "100%",
    justifyContent: "flex-end", // Align the button to the bottom
  },
  button: {
    justifyContent: "center",
    padding: 5,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 15,
    borderColor: "white",
    width: "100%",
    backgroundColor: "orange",
  },
  buttonText: {
    fontSize: 24,
    color: "white",
  },
  pdfContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  pdfItem: {
    flex: 1,
    alignItems: "center",
    marginBottom: 20,
    marginRight: 10,
  },
  pdfIcon: {
    width: 100,
    height: 100,
  },
  errorMessage: {
    textAlign: "center",
    marginVertical: 20,
  },
  closeButton: {
    padding: 10,
    backgroundColor: "red",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Blueprint;
