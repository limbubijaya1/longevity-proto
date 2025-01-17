import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "react-native-ui-datepicker"; // Import the new DatePicker
import { useSelector } from "react-redux";
import dayjs from "dayjs";

export default function Milestone() {
  const [modalVisible, setModalVisible] = useState(false);
  const [taskDescription, setTaskDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date()); // Set initial date to current date
  const [endDate, setEndDate] = useState(new Date()); // Same for end date
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const activeTab = useSelector((state) => state.tabs.activeTab);

  useEffect(() => {
    if (activeTab) {
      setShowStartPicker(false);
      setShowEndPicker(false);
      fetchTasks();
    }
  }, [activeTab]);

  const fetchTasks = async () => {
    setLoading(true);
    const storedUserId = await AsyncStorage.getItem("user_id");
    if (storedUserId && activeTab) {
      try {
        const response = await axios.get(
          `http://34.57.68.176:8000/get-all-tasks-from-category/${activeTab.key}`
        );
        if (response.data.tasks) {
          setTasks(response.data.tasks);
        } else {
          console.error("No tasks found in the response.");
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const AddTask = async () => {
    const storedUserId = await AsyncStorage.getItem("user_id");
    if (storedUserId && activeTab) {
      try {
        const response = await axios.post(
          `http://34.57.68.176:8000/add-task-breakdown/`,
          {
            user_id: storedUserId,
            cc_id: activeTab.key,
            tb_description: taskDescription,
            start_date: startDate,
            end_date: endDate,
          }
        );
        fetchTasks();
        resetFields();
      } catch (error) {
        console.error("Error adding Task:", error);
      }
    }
  };

  const handleAddTask = () => {
    if (!taskDescription || !startDate || !endDate) {
      alert("Please fill in all fields.");
      return;
    }

    if (endDate < startDate) {
      alert("End date cannot be earlier than start date.");
      return;
    }

    AddTask();
  };

  const resetFields = () => {
    setTaskDescription("");
    setStartDate(new Date());
    setEndDate(new Date());
    setModalVisible(false);
  };

  const formatDate = (date) => {
    return dayjs(date).format("YYYY-MM-DD");
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="orange"
          style={styles.loadingIndicator}
        />
      ) : (
        <>
          <Text style={styles.title}>Milestone</Text>
          <ScrollView>
            {tasks.length === 0 ? (
              <Text style={styles.noTasksText}>
                There are no tasks available.
              </Text>
            ) : (
              tasks.map((item, index) => (
                <View key={item.tb_id} style={styles.taskContainer}>
                  <Text style={styles.taskNumber}>{index + 1}. </Text>
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.taskDescription}>
                      {item.tb_description}
                    </Text>
                  </View>
                  <Text style={styles.taskStatus}>
                    {item.task_completion_status ? "Completed" : "Pending"}
                  </Text>
                  <View style={styles.iconContainer}>
                    {item.task_completion_status ? (
                      <Ionicons name="square" color="green" size={20} />
                    ) : (
                      <Ionicons name="triangle" color="red" size={20} />
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
          <View style={styles.addBtnContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>

          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={resetFields}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Task</Text>

                <Text style={styles.inputLabel}>Task Description:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Task Description"
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                />

                {/* Start Date */}
                <Text style={styles.inputLabel}>Start Date:</Text>
                <TouchableOpacity
                  onPress={() => setShowStartPicker(true)}
                  style={styles.dateContainer}
                >
                  <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                </TouchableOpacity>

                {/* End Date */}
                <Text style={styles.inputLabel}>End Date:</Text>
                <TouchableOpacity
                  onPress={() => setShowEndPicker(true)}
                  style={styles.dateContainer}
                >
                  <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                </TouchableOpacity>

                {/* Start Date Picker Modal */}
                <Modal
                  transparent={true}
                  animationType="fade"
                  visible={showStartPicker}
                  onRequestClose={() => setShowStartPicker(false)}
                >
                  <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Select Start Date</Text>
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
                        <Text style={styles.addButtonText}>Cancel</Text>
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
                      <Text style={styles.modalTitle}>Select End Date</Text>
                      <DateTimePicker
                        mode="single"
                        date={endDate}
                        selectedItemColor="orange"
                        headerButtonColor="orange"
                        onChange={(params) => {
                          const selectedDate = new Date(params.date);
                          if (selectedDate) {
                            if (selectedDate < startDate) {
                              alert(
                                "End date cannot be earlier than start date."
                              );
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
                        <Text style={styles.addButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleAddTask}
                  >
                    <Text style={styles.addButtonText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={resetFields}
                  >
                    <Text style={styles.addButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 20,
    width: 350,
  },
  loadingIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginVertical: 5,
    borderRadius: 15,
    backgroundColor: "#eeeee4",
    width: "100%",
  },
  inputLabel: {
    paddingBottom: 5,
  },
  taskNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
  },
  descriptionContainer: {
    flex: 1,
    paddingRight: 20,
    maxWidth: 200,
  },
  taskDescription: {
    fontSize: 15,
  },
  taskStatus: {
    fontSize: 14,
    color: "gray",
    marginRight: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    color: "black",
  },
  input: {
    height: 40,
    width: 250,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    backgroundColor: "white",
    borderRadius: 10,
    textAlign: "center",
  },
  dateContainer: {
    width: 250,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    marginBottom: 15,
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
  },
  addBtnContainer: {
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "orange",
    borderRadius: 20,
    padding: 10,
    marginVertical: 2,
    width: 150,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "orange",
    borderRadius: 20,
    padding: 10,
    marginVertical: 10,
    width: 120,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#d1ced3",
    borderRadius: 20,
    padding: 10,
    marginVertical: 10,
    width: 120,
    alignItems: "center",
    marginLeft: 10,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  noTasksText: {
    textAlign: "center",
    fontSize: 15,
    color: "gray",
    marginTop: 20,
  },
});
