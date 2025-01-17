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
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch } from "react-redux";
import { setProject } from "../features/project/projectSlice";

export default function Index() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserIdAndProjects();
  }, []);

  const fetchUserIdAndProjects = async () => {
    setLoading(true);
    try {
      const storedUserId = await AsyncStorage.getItem("user_id");
      setUserId(storedUserId);

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
    router.push("/projectPage"); // Use router for navigation
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
              placeholder="Search..."
              value={searchQuery}
              onChangeText={handleSearch}
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
              <View key={project.project_id} style={styles.projectItemContainer}>
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
            <TouchableOpacity style={styles.addProjectButton}>
              <Text style={styles.addProjectButtonText}>Add Project</Text>
            </TouchableOpacity>
          </View>
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
});
