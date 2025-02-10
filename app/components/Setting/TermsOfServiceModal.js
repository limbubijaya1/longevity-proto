import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView, // Import SafeAreaView
} from "react-native";
import axios from "axios";

const TermsOfServiceModal = ({ visible, onClose }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const [termsOfService, setTermsOfService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTermsOfService = async () => {
      try {
        const response = await axios.get(`${API_URL}/terms-of-service`);
        setTermsOfService(response.data);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch terms of service.");
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchTermsOfService();
    }
  }, [visible]);

  if (loading) {
    return (
      <Modal visible={visible} animationType="fade">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f39200" />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {termsOfService ? (
              <>
                <Text style={styles.title}>{termsOfService.title}</Text>
                <Text style={styles.lastUpdated}>
                  Last Updated: {termsOfService.last_updated}
                </Text>
                <Text style={styles.introduction}>
                  {termsOfService.introduction}
                </Text>

                <Text style={styles.sectionTitle}>Use of Services:</Text>
                {termsOfService.use_of_services.map((item, index) => (
                  <Text key={index} style={styles.content}>
                    • {item}
                  </Text>
                ))}

                <Text style={styles.sectionTitle}>User Accounts:</Text>
                <Text style={styles.content}>
                  {termsOfService.user_accounts.registration}
                </Text>
                <Text style={styles.content}>
                  {termsOfService.user_accounts.security}
                </Text>
                <Text style={styles.content}>
                  {termsOfService.user_accounts.account_termination}
                </Text>

                <Text style={styles.sectionTitle}>Intellectual Property:</Text>
                <Text style={styles.content}>
                  {termsOfService.intellectual_property}
                </Text>

                <Text style={styles.sectionTitle}>
                  Limitation of Liability:
                </Text>
                <Text style={styles.content}>
                  {termsOfService.limitation_of_liability}
                </Text>

                <Text style={styles.sectionTitle}>Privacy Policy:</Text>
                <Text style={styles.content}>
                  {termsOfService.privacy_policy}
                </Text>

                <Text style={styles.sectionTitle}>Modifications to Terms:</Text>
                <Text style={styles.content}>
                  {termsOfService.modifications_to_terms}
                </Text>

                <Text style={styles.sectionTitle}>Governing Law:</Text>
                <Text style={styles.content}>
                  {termsOfService.governing_law}
                </Text>

                <Text style={styles.sectionTitle}>Contact Us:</Text>
                <Text style={styles.content}>
                  Email: {termsOfService.contact_us.email}
                </Text>
                <Text style={styles.content}>
                  Phone: {termsOfService.contact_us.phone}
                </Text>
                <Text style={styles.content}>
                  Address: {termsOfService.contact_us.address}
                </Text>
              </>
            ) : (
              <Text style={styles.error}>Failed to load terms of service.</Text>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  scrollContainer: {
    paddingBottom: 20, // Add some padding at the bottom
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  lastUpdated: {
    fontSize: 16,
    marginBottom: 10,
    fontStyle: "italic",
  },
  introduction: {
    fontSize: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  content: {
    fontSize: 16,
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: "#f39200",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "white",
  },
  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});

export default TermsOfServiceModal;
