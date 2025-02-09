import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking, // Import Linking
} from "react-native";
import axios from "axios";
import { API_URL } from "@env";
import { useSelector } from "react-redux";
import words from "../../../constants/words";

const Contact = () => {
  const currentLanguage = useSelector((state) => state.language.language);
  const currentWord = currentLanguage === "zh" ? words.chinese : words.english;
  const user_id = useSelector((state) => state.user.userId);
  const [contacts, setContacts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/get-contact-details/${user_id}`
      );
      setContacts(response.data.grouped_contacts);
    } catch (error) {
      console.error(error);
      Alert.alert(currentWord.error, "Failed to fetch contact details.");
    } finally {
      setLoading(false);
    }
  };

  const roleOrder = [
    { key: "Management Team", label: currentWord.roleManagementTeam },
    { key: "Project Manager", label: currentWord.roleProjectManager },
    { key: "Admin", label: currentWord.roleAdmin },
    { key: "Subcontractor", label: currentWord.roleSubcontractor },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {roleOrder.map((role) => {
          const roleContacts = contacts[role.key];
          if (roleContacts && roleContacts.length > 0) {
            return (
              <View key={role.key} style={styles.roleContainer}>
                <Text style={styles.roleText}>{role.label}</Text>
                {roleContacts.map((contact) => (
                  <View
                    key={`${role.key}-${contact.user_id}`}
                    style={styles.contactInfo}
                  >
                    <Text style={styles.usernameText}>{contact.username}</Text>
                    <Text style={styles.contactDetail}>
                      {currentWord.phoneNumber}{" "}
                      <Text
                        style={styles.link}
                        onPress={() =>
                          Linking.openURL(`tel:${contact.user_mobile}`)
                        }
                      >
                        {contact.user_mobile}
                      </Text>
                    </Text>
                    <Text style={styles.contactDetail}>
                      {currentWord.emailAddress}{" "}
                      <Text
                        style={styles.link}
                        onPress={() =>
                          Linking.openURL(`mailto:${contact.user_email}`)
                        }
                      >
                        {contact.user_email}
                      </Text>
                    </Text>
                  </View>
                ))}
              </View>
            );
          }
          return null;
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainContainer: {
    paddingBottom: 0,
    width: "100%",
    height: "100%",
  },
  container: {
    padding: 10,
  },
  roleContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  roleText: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: "#333",
    marginBottom: 10,
  },
  contactInfo: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 15,
    backgroundColor: "rgba(255, 156, 64, 0.35)",
    borderColor: "orange",
    marginBottom: 4,
  },
  usernameText: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  contactDetail: {
    fontSize: 14,
    color: "black",
  },
  link: {
    textDecorationLine: "underline", // Optional: adds an underline to the text
  },
});

export default Contact;
