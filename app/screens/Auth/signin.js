import { useTheme } from "@react-navigation/native";
import axios from "axios";
import { API_URL } from "@env";
import { jwtDecode } from "jwt-decode";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import AntDesign from "react-native-vector-icons/AntDesign";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setUser } from "../../../features/user/userSlice";
import { useRouter } from "expo-router";

export default function Signin() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async () => {
    setErrorMessage("");
    if (!userName || !password) {
      setErrorMessage("Username and password are required.");
      return;
    }

    try {
      const response = await axios.post(
        "${API_URL}/token",
        new URLSearchParams({
          grant_type: "password",
          username: userName,
          password: password,
          client_id: "",
          client_secret: "",
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const { access_token } = response.data;
      await AsyncStorage.setItem("access_token", access_token);

      const decodedToken = jwtDecode(access_token);
      const expirationTime = decodedToken.exp * 1000;
      await AsyncStorage.setItem("token_expiration", expirationTime.toString());

      const userResponse = await axios.get("${API_URL}/users/me/", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      const { full_name, user_id } = userResponse.data;
      dispatch(setUser({ fullName: full_name, userId: user_id }));

      await AsyncStorage.setItem("full_name", full_name);
      await AsyncStorage.setItem("user_id", user_id);

      router.push("/");
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || "Error signing in. Please try again."
      );
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/images/logo.png")}
              resizeMode="contain"
              style={styles.logo}
            />
            <Text style={styles.logoText}>工程管理系統</Text>
            <Text style={styles.titleText}>ACTIONPRO</Text>
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <FontAwesome5
                name="user-circle"
                size={20}
                style={styles.leftIcon}
              />
              <TextInput
                placeholder="Username"
                value={userName}
                onChangeText={setUserName}
                keyboardType="default"
                autoCapitalize="none"
                style={[
                  styles.input,
                  {
                    paddingLeft: 40,
                  },
                ]}
              />
            </View>
            <View style={styles.iconContainer}>
              <AntDesign
                name="checksquareo"
                size={20}
                style={styles.leftIcon}
              />
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={[
                  styles.input,
                  {
                    paddingRight: 40,
                    paddingLeft: 40,
                  },
                ]}
                secureTextEntry
                onSubmitEditing={handleSignIn}
                returnKeyType="done"
              />
              <AntDesign
                name="enter"
                size={20}
                style={styles.rightIcon}
                onPress={handleSignIn}
              />
            </View>
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text> // Display error message
          ) : null}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingBottom: 100,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignSelf: "center",
    padding: 16,
  },
  logoText: {
    paddingTop: 5,
    fontSize: 12,
  },
  inputContainer: {
    width: 250,
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  iconContainer: {
    position: "relative",
  },
  leftIcon: {
    position: "absolute",
    left: 10,
    top: 10,
  },
  rightIcon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  input: {
    width: "100%",
    height: 40,
    fontSize: 12,
    borderWidth: 2,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  titleText: {
    fontSize: 25,
  },
  forgotPassword: {
    textAlign: "right",
    fontSize: 12,
  },
  errorMessage: {
    color: "red",
    marginTop: 15,
    textAlign: "center",
  },
});
