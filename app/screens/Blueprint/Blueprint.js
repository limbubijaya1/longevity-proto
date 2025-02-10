import React, { useEffect, useState } from "react";
import AddArea from "../../components/AddArea";
import AddAreaFloorPlan from "../../components/AddAreaFloorPlan";
import AddMainFloorPlan from "../../components/AddMainFloorPlan";
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
import { useDispatch, useSelector } from "react-redux";
import PdfViewer from "../../components/PdfViewer"; // Import the PdfViewer component

const Blueprint = () => {
  const API_URL = process.env.EXPO_API_URL;
  const [areas, setAreas] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [selectedArea, setSelectedArea] = useState("Main");
  const [showAreaList, setShowAreaList] = useState(false);
  const [addAreaModalVisible, setAddAreaModalVisible] = useState(false);
  const [addAreaFloorPlanModalVisible, setAddAreaFloorPlanModalVisible] =
    useState(false);
  const [addMainFloorPlanModalVisible, setAddMainFloorPlanModalVisible] =
    useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPdfUri, setSelectedPdfUri] = useState(null);
  const project_id = useSelector((state) => state.project.project.project_id);

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

  const fetchFloorPlans = async () => {
    try {
      console.log(project_id);
      const response = await axios.get(
        `${API_URL}/project-details/${project_id}`
      );

      // Map over the fetched floor plan documents to create updatedFiles
      const updatedFiles = response.data.floor_plan_documents.map((plan) => {
        const { floor_plan_id, extension, name, content_type } = plan;
        return {
          uri: `${API_URL}/main-floor-plan/${floor_plan_id}.${extension}`,
          name,
          content_type,
        };
      });

      // Set the files state with the updatedFiles
      setFiles(updatedFiles);
      console.log(updatedFiles); // Log to verify the output
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCurrentAreaFiles = async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/get-floor-plan-id-from-area/${id}`
      );

      if (response.data.pic_details.length === 0) {
        setFiles([]);
      } else {
        const areaFiles = response.data.pic_details.map((item) => ({
          uri: `${API_URL}/area-floor-plan${item.image_url}`,
          name: item.floor_plan_name,
          content_type: item.content_type,
        }));
        setFiles(areaFiles);
      }
    } catch (error) {
      if (error.response && error.response.status !== 500) {
        console.error("Error fetching files:", error);
      }
      setFiles([]);
    }
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
      <View style={styles.titleContainer}>
        <Text style={styles.title}>總施工圖</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.leftSide}>
          <View
            style={[
              styles.mainAreaBtnContainer,
              selectedArea === "Main" && styles.activeAreaItem,
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                setFiles([]);
                setSelectedArea("Main");
                setShowAreaList(false);
                fetchFloorPlans();
              }}
            >
              <Text style={styles.mainAreaBtnText}>Main</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.dropdownButton,
              selectedArea === "Area" && styles.activeAreaItem,
            ]}
            onPress={() => {
              setFiles([]);
              setShowAreaList(!showAreaList);
              setSelectedArea("Area");
            }}
          >
            <Text style={styles.dropdownButtonText}>Area</Text>
          </TouchableOpacity>

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
                    setSelectedAreaId(item.area_id);
                    fetchCurrentAreaFiles(item.area_id);
                  }}
                >
                  <Text>{item.description}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setAddAreaModalVisible(true)}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.pdfContainer}>
          <FlatList
            data={
              selectedArea !== "Area"
                ? [...files, { isAddAreaButton: true }]
                : ""
            }
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              if (item.isAddAreaButton) {
                return (
                  <TouchableOpacity
                    style={styles.addAreaButtonText}
                    onPress={() => {
                      selectedArea != "Main"
                        ? setAddAreaFloorPlanModalVisible(true)
                        : setAddMainFloorPlanModalVisible(true);
                    }}
                  >
                    <View style={styles.pdfIconContainer}>
                      <Text style={styles.addAreaButtonText}>+</Text>
                    </View>
                    <Text style={styles.pdfItemText}>Add Floor Plan</Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity onPress={() => handlePdfClick(item.uri)}>
                  <View style={styles.pdfItem}>
                    <Image source={{ uri: item.uri }} style={styles.pdfIcon} />
                    <Text>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            numColumns={2}
          />
        </View>
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <PdfViewer uri={selectedPdfUri} />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setModalVisible(false)}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </Modal>

      <AddArea
        modalVisible={addAreaModalVisible}
        setModalVisible={setAddAreaModalVisible}
        fetchAreas={fetchAreas}
      />

      <AddAreaFloorPlan
        modalVisible={addAreaFloorPlanModalVisible}
        setModalVisible={setAddAreaFloorPlanModalVisible}
        areaId={selectedAreaId} // Pass the selected area ID
        fetchCurrentAreaFiles={fetchCurrentAreaFiles}
      />

      <AddMainFloorPlan
        modalVisible={addMainFloorPlanModalVisible}
        setModalVisible={setAddMainFloorPlanModalVisible}
        fetchFloorPlans={fetchFloorPlans}
      />
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
  addButtonContainer: {
    flex: 1,
    alignItems: "center",
    marginBottom: 20,
    marginRight: 10,
  },
  pdfIcon: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderRadius: 10,
  },
  pdfIconContainer: {
    width: 100,
    height: 100,
    backgroundColor: "orange",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  addAreaButtonText: {
    fontSize: 24,
    color: "white",
  },
  pdfItemText: {
    textAlign: "center",
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
