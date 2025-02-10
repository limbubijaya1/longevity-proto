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

const PrivacyPolicyModal = ({ visible, onClose }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const [privacyPolicy, setPrivacyPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        const response = await axios.get(`${API_URL}/privacy-policy`);
        setPrivacyPolicy(response.data);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch privacy policy.");
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchPrivacyPolicy();
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
    <Modal visible={visible} animationType="fade">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {privacyPolicy ? (
              <>
                <Text style={styles.title}>{privacyPolicy.title}</Text>
                <Text style={styles.lastUpdated}>
                  Last Updated: {privacyPolicy.last_updated}
                </Text>
                <Text style={styles.introduction}>
                  {privacyPolicy.introduction}
                </Text>

                <Text style={styles.sectionTitle}>Information We Collect:</Text>
                <Text style={styles.content}>
                  {privacyPolicy.information_we_collect.personal_data}
                </Text>
                <Text style={styles.content}>
                  {privacyPolicy.information_we_collect.non_personal_data}
                </Text>

                <Text style={styles.sectionTitle}>
                  How We Use Your Information:
                </Text>
                {privacyPolicy.how_we_use_your_information.map(
                  (item, index) => (
                    <Text key={index} style={styles.content}>
                      • {item}
                    </Text>
                  )
                )}

                <Text style={styles.sectionTitle}>
                  Data Sharing and Disclosure:
                </Text>
                <Text style={styles.content}>
                  {privacyPolicy.data_sharing_and_disclosure.third_parties}
                </Text>
                <Text style={styles.content}>
                  {privacyPolicy.data_sharing_and_disclosure.legal_compliance}
                </Text>

                <Text style={styles.sectionTitle}>Data Protection:</Text>
                <Text style={styles.content}>
                  {privacyPolicy.data_protection}
                </Text>

                <Text style={styles.sectionTitle}>Your Rights:</Text>
                {privacyPolicy.your_rights.map((right, index) => (
                  <Text key={index} style={styles.content}>
                    • {right}
                  </Text>
                ))}

                <Text style={styles.sectionTitle}>Changes to This Policy:</Text>
                <Text style={styles.content}>
                  {privacyPolicy.changes_to_this_policy}
                </Text>

                <Text style={styles.sectionTitle}>Contact Us:</Text>
                <Text style={styles.content}>
                  Email: {privacyPolicy.contact_us.email}
                </Text>
                <Text style={styles.content}>
                  Phone: {privacyPolicy.contact_us.phone}
                </Text>
                <Text style={styles.content}>
                  Address: {privacyPolicy.contact_us.address}
                </Text>
              </>
            ) : (
              <Text style={styles.error}>Failed to load privacy policy.</Text>
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

export default PrivacyPolicyModal;
