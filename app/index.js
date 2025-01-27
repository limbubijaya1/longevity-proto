import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import axios from "axios";
import TopNav from "./topNav";
import LowerNav from "./lowerNav";
import { useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Modal,
  Alert,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch, useSelector } from "react-redux";
import { setProject } from "../features/project/projectSlice";
import DateTimePicker from "react-native-ui-datepicker";
import dayjs from "dayjs";

export default function Index() {
  const currentLanguage = useSelector((state) => state.language.language);
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [userId, setUserId] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // State for modal inputs
  const [projectName, setProjectName] = useState("");
  const [quoteeName, setQuoteeName] = useState("");
  const [quoteeMobile, setQuoteeMobile] = useState("");
  const [quoteeEmail, setQuoteeEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [floorUnit, setFloorUnit] = useState("");
  const [street, setStreet] = useState("");
  const [startDate, setStartDate] = useState(new Date()); // Set initial date to current date
  const [endDate, setEndDate] = useState(new Date()); // Same for end date

  useEffect(() => {
    fetchUserIdAndProjects();
  }, []);

  const fetchUserIdAndProjects = async () => {
    setLoading(true);
    try {
      const storedUserId = await AsyncStorage.getItem("user_id");
      const storedCompanyId = await AsyncStorage.getItem("company_id");
      setUserId(storedUserId);
      setCompanyId(storedCompanyId);

      if (storedUserId) {
        const response = await axios.get(
          `http://34.57.68.176:8000/get-project-from-user/${storedUserId}`
        );
        if (Array.isArray(response.data.projects)) {
          setProjects(response.data.projects);
          setFilteredProjects(response.data.projects);
        } else {
          console.error("Expected an array, but got:", response.data.projects);
          setProjects([]);
          setFilteredProjects([]);
        }
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleProjectClick = (project) => {
    dispatch(setProject(project));
    router.push("/projectPage");
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserIdAndProjects();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = projects.filter((project) =>
        project.project_title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  };

  const addProject = async () => {
    // Validate required fields
    if (
      !projectName ||
      !quoteeName ||
      !quoteeMobile ||
      !quoteeEmail ||
      !companyName ||
      !district ||
      !area ||
      !floorUnit ||
      !street
    ) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }

    if (endDate < startDate) {
      Alert.alert(
        "Validation Error",
        "End date cannot be earlier than start date."
      );
      return;
    }

    const projectAddressObject = {
      district,
      area,
      street,
      floor_unit: floorUnit,
    };

    try {
      const newProject = {
        user_id: userId,
        user_company_id: companyId,
        project_name: projectName,
        project_start_date: formatDate(startDate),
        project_end_date: formatDate(endDate),
        quotee_name: quoteeName,
        quotee_mobile: quoteeMobile,
        quotee_email: quoteeEmail,
        company_name: companyName,
        project_address: projectAddressObject, // Corrected this line
      };
      console.log(newProject);
      const response = await axios.post(
        "http://34.57.68.176:8000/add-project",
        newProject
      );
      if (response.status === 200) {
        Alert.alert("Success", "Project added successfully!");
        fetchUserIdAndProjects();
        setModalVisible(false);
        resetModalFields();
      } else {
        Alert.alert("Error", "Failed to add project.");
      }
    } catch (error) {
      console.error("Error adding project:", error);
      Alert.alert("Error", "An error occurred while adding the project.");
    }
  };

  const formatDate = (date) => {
    return dayjs(date).format("YYYY-MM-DD");
  };

  const resetModalFields = () => {
    setProjectName("");
    setQuoteeName("");
    setQuoteeMobile("");
    setQuoteeEmail("");
    setCompanyName("");
    setProjectAddress("");
    setStartDate(new Date());
    setEndDate(new Date());
  };

  const currentWord = currentLanguage === "zh" ? words.chinese : words.english;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <View style={styles.topContainer}>
          <TopNav />
        </View>
        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchBar}
              placeholder={currentWord.search}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="gray"
            />
            <MaterialCommunityIcons
              name="magnify"
              size={25}
              style={styles.searchIcon}
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || loading}
                onRefresh={onRefresh}
              />
            }
          >
            {filteredProjects.map((project) => (
              <View
                key={project.project_id}
                style={styles.projectItemContainer}
              >
                <TouchableOpacity onPress={() => handleProjectClick(project)}>
                  <View style={styles.projectItem}>
                    <Text style={styles.projectName}>
                      {project.project_title}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.addProjectButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addProjectButtonText}>
                {currentWord.addProject}
              </Text>
            </TouchableOpacity>
          </View>

          <Modal
            transparent={true}
            animationType="fade"
            visible={showStartPicker}
            onRequestClose={() => setShowStartPicker(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {currentWord.selectStartDate}
                </Text>
                <DateTimePicker
                  mode="single"
                  date={startDate}
                  selectedItemColor="orange"
                  headerButtonColor="orange"
                  onChange={(params) => {
                    const selectedDate = new Date(params.date);
                    if (selectedDate) {
                      setStartDate(selectedDate);
                    }
                    setShowStartPicker(false);
                  }}
                />
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowStartPicker(false)}
                >
                  <Text style={styles.addButtonText}>{currentWord.cancel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* End Date Picker Modal */}
          <Modal
            transparent={true}
            animationType="fade"
            visible={showEndPicker}
            onRequestClose={() => setShowEndPicker(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {currentWord.selectEndtDate}
                </Text>
                <DateTimePicker
                  mode="single"
                  date={endDate}
                  selectedItemColor="orange"
                  headerButtonColor="orange"
                  onChange={(params) => {
                    const selectedDate = new Date(params.date);
                    if (selectedDate) {
                      if (selectedDate < startDate) {
                        alert("End date cannot be earlier than start date.");
                      } else {
                        setEndDate(selectedDate);
                      }
                    }
                    setShowEndPicker(false);
                  }}
                />
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowEndPicker(false)}
                >
                  <Text style={styles.addButtonText}>{currentWord.cancel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Modal for Adding Project */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{currentWord.title}</Text>
                <ScrollView style={styles.inputField}>
                  <TextInput
                    placeholder={currentWord.projectName}
                    value={projectName}
                    onChangeText={setProjectName}
                    style={styles.input}
                    placeholderTextColor="gray"
                  />
                  <TextInput
                    placeholder={currentWord.quoteeName}
                    value={quoteeName}
                    onChangeText={setQuoteeName}
                    style={styles.input}
                    placeholderTextColor="gray"
                  />
                  <TextInput
                    placeholder={currentWord.quoteeMobile}
                    value={quoteeMobile}
                    onChangeText={setQuoteeMobile}
                    style={styles.input}
                    keyboardType="phone-pad"
                    placeholderTextColor="gray"
                  />
                  <TextInput
                    placeholder={currentWord.quoteeEmail}
                    value={quoteeEmail}
                    onChangeText={setQuoteeEmail}
                    style={styles.input}
                    keyboardType="email-address"
                    placeholderTextColor="gray"
                  />
                  <TextInput
                    placeholder={currentWord.companyName}
                    value={companyName}
                    onChangeText={setCompanyName}
                    style={styles.input}
                    placeholderTextColor="gray"
                  />

                  {/* New Address Fields */}
                  <TextInput
                    placeholder={currentWord.district}
                    value={district}
                    onChangeText={setDistrict}
                    style={styles.input}
                    placeholderTextColor="gray"
                  />
                  <TextInput
                    placeholder={currentWord.area}
                    value={area}
                    onChangeText={setArea}
                    style={styles.input}
                    placeholderTextColor="gray"
                  />
                  <TextInput
                    placeholder={currentWord.street}
                    value={street}
                    onChangeText={setStreet}
                    style={styles.input}
                    placeholderTextColor="gray"
                  />
                  <TextInput
                    placeholder={currentWord.floorUnit}
                    value={floorUnit}
                    onChangeText={setFloorUnit}
                    style={styles.input}
                    placeholderTextColor="gray"
                  />

                  <Text style={styles.inputLabel}>{currentWord.startDate}</Text>
                  <TouchableOpacity
                    onPress={() => setShowStartPicker(true)}
                    style={styles.dateContainer}
                  >
                    <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                  </TouchableOpacity>

                  <Text style={styles.inputLabel}>{currentWord.endDate}</Text>
                  <TouchableOpacity
                    onPress={() => setShowEndPicker(true)}
                    style={styles.dateContainer}
                  >
                    <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                  </TouchableOpacity>
                </ScrollView>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={addProject}
                  >
                    <Text style={styles.modalButtonText}>
                      {currentWord.addProject}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setModalVisible(false);
                      resetModalFields();
                    }}
                  >
                    <Text style={styles.modalButtonText}>
                      {currentWord.cancel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
        <View style={styles.lowerContainer}>{/* <LowerNav /> */}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: "100%",
    backgroundColor: "#f3eee3",
  },
  mainContainer: {
    flex: 1,
  },
  topContainer: {
    marginTop: 40,
  },
  inputField: {
    height: 250,
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    position: "relative",
    width: "100%",
  },
  searchContainer: {
    width: "95%",
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    top: 8,
    right: 20,
    zIndex: 1,
  },
  searchBar: {
    height: 40,
    backgroundColor: "white",
    borderRadius: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: "100%",
    paddingLeft: 15,
    paddingRight: 40,
  },
  lowerContainer: {
    justifyContent: "flex-end",
  },
  scrollView: {
    flexGrow: 1,
    alignItems: "center",
  },
  projectItemContainer: {
    marginBottom: 10,
    backgroundColor: "white",
    borderRadius: 10,
    width: "300",
    paddingHorizontal: 10,
  },
  projectItem: {
    minHeight: 50,
    flex: 1,
    justifyContent: "center",
  },
  projectName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  contentText: {
    padding: 10,
    fontSize: 14,
    color: "#333",
  },
  addProjectButton: {
    backgroundColor: "#f39200",
    color: "white",
    borderRadius: 30,
    padding: 10,
    width: "100%",
    height: 50,
    minWidth: 150,
  },
  addProjectButtonText: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
  },
  buttonContainer: {
    width: "50%",
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: "orange",
    borderRadius: 5,
    padding: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "gray",
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  inputLabel: {
    color: "gray",
  },
  dateContainer: {
    height: 40,
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    marginBottom: 10,
    alignItems: "center",
  },
  dateText: {
    color: "gray",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});

const words = {
  english: {
    search: "Search...",
    selectStartDate: "Select Start Date",
    selectEndtDate: "Select End Date",
    addProject: "Add Project",
    cancel: "Cancel",
    title: "Add New Project",
    projectName: "Project Name",
    quoteeName: "Quotee Name",
    quoteeMobile: "Quotee Mobile",
    quoteeEmail: "Quotee Email",
    companyName: "Company Name",
    district: "District",
    area: "Area",
    street: "Street",
    floorUnit: "Floor Unit",
    startDate: "Start Date:",
    endDate: "End Date:",
  },
  chinese: {
    search: "搜尋...",
    selectStartDate: "选择开始日期",
    selectEndtDate: "选择结束日期",
    addProject: "加項目",
    cancel: "取消",
    title: "加入新項目",
    projectName: "項目名稱",
    quoteeName: "引用者名稱",
    quoteeMobile: "報價手機號碼",
    quoteeEmail: "報價電郵",
    companyName: "公司名稱",
    district: "區",
    area: "地區",
    street: "街",
    floorUnit: "樓層單位",
    startDate: "開始日期：",
    endDate: "結束日期：",
  },
};
