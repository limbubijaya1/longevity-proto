import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";

const AboutUsModal = ({ visible, onClose }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const [aboutInfo, setAboutInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutInfo = async () => {
      try {
        const response = await axios.get(`${API_URL}/about-us`);
        setAboutInfo(response.data);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch about us information.");
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchAboutInfo();
    }
  }, [visible]);

  if (loading) {
    return (
      <Modal visible={visible} animationType="fade" transparent={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f39200" />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {aboutInfo ? (
            <>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{aboutInfo.company_name}</Text>
              </View>
              <Text style={styles.mission}>Mission </Text>
              <Text style={styles.missionText}>{aboutInfo.mission}</Text>
              <Text style={styles.contact}>Contact Information:</Text>
              <View style={styles.contactDetails}>
                <View style={styles.addressContainer}>
                  <Text style={styles.addressLabel}>Email: </Text>
                  <Text style={styles.addressText}>
                    {aboutInfo.contact_email}
                  </Text>
                </View>

                <View style={styles.addressContainer}>
                  <Text style={styles.addressLabel}>Phone: </Text>
                  <Text style={styles.addressText}>
                    {aboutInfo.contact_phone}
                  </Text>
                </View>

                <View style={styles.addressContainer}>
                  <Text style={styles.addressLabel}>Address:</Text>
                  <Text style={styles.addressText}>{aboutInfo.address}</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.error}>Failed to load information.</Text>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  loadingContainer: {
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
  },
  titleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  mission: {
    fontSize: 22,
    color: "#555",
    fontWeight: "600",
  },
  missionText: {
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
    textAlign: "left",
  },
  contact: {
    fontSize: 20,
    marginBottom: 5,
    color: "#333",
    fontWeight: "600",
  },
  contactDetails: {
    width: "100%",
  },
  contactItem: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "600",
    color: "#333",
  },
  addressContainer: {
    flexDirection: "row",
    marginBottom: 5,
  },
  addressLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    paddingRight: 2,
  },
  addressText: {
    fontSize: 16,
    color: "#333",
    flex: 3,
  },
  closeButton: {
    backgroundColor: "#f39200",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginTop: 15,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});

export default AboutUsModal;
