import React, { useEffect, useState } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Provider } from "react-redux";
import store from "../store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setUser } from "../features/user/userSlice";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

SplashScreen.preventAutoHideAsync();

function UserLoader({ setIsAuthenticated }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadUserData = async () => {
      const token = await AsyncStorage.getItem("access_token");
      console.log("Token exists: ", token);

      if (token) {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp > currentTime) {
          const fullName = await AsyncStorage.getItem("full_name");
          const userId = await AsyncStorage.getItem("user_id");

          if (fullName && userId) {
            dispatch(setUser({ fullName, userId }));
            setIsAuthenticated(true); // User is authenticated
          } else {
            try {
              const userResponse = await axios.get(
                "http://34.57.68.176:8000/users/me/",
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              const { full_name, user_id } = userResponse.data;
              dispatch(setUser({ fullName: full_name, userId: user_id }));

              await AsyncStorage.setItem("full_name", full_name);
              await AsyncStorage.setItem("user_id", user_id);
              setIsAuthenticated(true); // User is authenticated
            } catch (err) {
              console.error("Error fetching user data:", err);
              setIsAuthenticated(false); // User not authenticated
            }
          }
        } else {
          console.log("Token expired. Clearing storage...");
          await AsyncStorage.clear();
          setIsAuthenticated(false); // Token expired
        }
      } else {
        console.log("No token found. Redirecting to sign-in...");
        setIsAuthenticated(false); // No token found
      }
    };

    loadUserData();
  }, [dispatch, setIsAuthenticated]);

  return null; // No UI needed for this component
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null; // Show nothing until fonts are loaded
  }

  return (
    <Provider store={store}>
      <UserLoader setIsAuthenticated={setIsAuthenticated} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="index" />
            <Stack.Screen name="quotation" />
            <Stack.Screen name="invoice" />
            <Stack.Screen name="materialPage" />
            <Stack.Screen name="progressPage" />
            <Stack.Screen name="projectPage" />
            <Stack.Screen name="materialSubPage" />
          </>
        ) : (
          <Stack.Screen name="signin" />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </Provider>
  );
}
