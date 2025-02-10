import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import UpdateUserDetailsModal from "../../components/Setting/UpdateUserDetailsModal";
import ChangePasswordModal from "../../components/Setting/ChangePasswordModal";
import LanguageSelectionModal from "../../components/Setting/ChangeLanguageModal";
import AboutUsModal from "../../components/Setting/AboutUsModal";
import PrivacyPolicyModal from "../../components/Setting/PrivacyPolicyModal";
import TermsOfServiceModal from "../../components/Setting/TermsOfServiceModal";

export default function SettingPage() {
  const router = useRouter();
  const [updateUserDetailsModalVisible, setUpdateUserDetailsModalVisible] =
    useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] =
    useState(false);
  const [languageSelectionModalVisible, setLanguageSelectionModalVisible] =
    useState(false);
  const [aboutUsModalVisible, setAboutUsModalVisible] = useState(false);
  const [privacyPolicyModalVisible, setPrivacyPolicyModalVisible] =
    useState(false);
  const [termsOfServiceModalVisible, setTermsOfServiceModalVisible] =
    useState(false);

  const handleUpdateUserDetails = () => {
    setUpdateUserDetailsModalVisible(true);
  };

  const handleModalClose = () => {
    setUpdateUserDetailsModalVisible(false);
  };

  const handleChangePassword = () => {
    setChangePasswordModalVisible(true);
  };

  const handleChangePasswordModalClose = () => {
    setChangePasswordModalVisible(false);
  };

  const handleSwitchLanguage = () => {
    setLanguageSelectionModalVisible(true);
  };

  const handleLanguageModalClose = () => {
    setLanguageSelectionModalVisible(false);
  };

  const handleAboutUs = () => {
    setAboutUsModalVisible(true);
  };

  const handleAboutUsModalClose = () => {
    setAboutUsModalVisible(false);
  };

  const handlePrivacyPolicy = () => {
    setPrivacyPolicyModalVisible(true);
  };

  const handlePrivacyPolicyModalClose = () => {
    setPrivacyPolicyModalVisible(false);
  };

  const handleTermsOfService = () => {
    setTermsOfServiceModalVisible(true);
  };

  const handleTermsOfServiceModalClose = () => {
    setTermsOfServiceModalVisible(false);
  };

  const handleSubmit = async (userData) => {
    try {
      const response = await fetch("YOUR_API_URL", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        Alert.alert("Success", "User details updated successfully!");
      } else {
        Alert.alert("Error", "Failed to update user details.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const handleAllowNotifications = () => {
    Alert.alert("Notifications", "Navigating to notification settings...");
    // Add logic for allowing notifications here
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert("Logout", "You have been logged out.");
      router.push("screens/Auth/signin"); 
    } catch (error) {
      Alert.alert("Error", "Something went wrong during logout.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#f39200" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdateUserDetails}
        >
          <Text style={styles.buttonText}>Update User Details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSwitchLanguage}>
          <Text style={styles.buttonText}>Switch Language</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleAllowNotifications}
        >
          <Text style={styles.buttonText}>Allow Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleAboutUs}>
          <Text style={styles.buttonText}>About Us</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handlePrivacyPolicy}>
          <Text style={styles.buttonText}>Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleTermsOfService}>
          <Text style={styles.buttonText}>Terms of Service</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <UpdateUserDetailsModal
          visible={updateUserDetailsModalVisible}
          onClose={handleModalClose}
          onSubmit={handleSubmit}
        />

        <ChangePasswordModal
          visible={changePasswordModalVisible}
          onClose={handleChangePasswordModalClose}
        />

        <LanguageSelectionModal
          visible={languageSelectionModalVisible}
          onClose={handleLanguageModalClose}
        />

        <AboutUsModal
          visible={aboutUsModalVisible}
          onClose={handleAboutUsModalClose}
        />

        <PrivacyPolicyModal
          visible={privacyPolicyModalVisible}
          onClose={handlePrivacyPolicyModalClose}
        />

        <TermsOfServiceModal
          visible={termsOfServiceModalVisible}
          onClose={handleTermsOfServiceModalClose}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f3eee3",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#f39200",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#d9534f",
    padding: 15,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
});
