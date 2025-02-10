import React, { useEffect, useState } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
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

function UserLoader() {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const dispatch = useDispatch();
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const loadUserData = async () => {
      const token = await AsyncStorage.getItem("access_token");

      if (token) {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp > currentTime) {
          // Token is valid
          const fullName = await AsyncStorage.getItem("full_name");
          const userId = await AsyncStorage.getItem("user_id");
          const companyId = await AsyncStorage.getItem("company_id");

          if (fullName && userId && companyId) {
            dispatch(setUser({ fullName, userId, companyId }));
            router.replace("/"); // Navigate to index if authenticated
            return; // User is authenticated
          }
          try {
            const userResponse = await axios.get(`${API_URL}/users/me/`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const { full_name, user_id, company_id } = userResponse.data;
            dispatch(
              setUser({
                fullName: full_name,
                userId: user_id,
                companyId: company_id,
              })
            );

            await AsyncStorage.setItem("full_name", full_name);
            await AsyncStorage.setItem("user_id", user_id);
            await AsyncStorage.setItem("company_id", company_id);
            router.replace("/"); // Navigate to index if authenticated
            return; // User is authenticated
          } catch (err) {
            console.error("Error fetching user data:", err);
          }
        } else {
          console.log("Token expired. Clearing storage...");
          await AsyncStorage.clear();
        }
      }

      // Redirect to sign-in if no token or token expired
      router.replace("screens/Auth/signin");
    };

    loadUserData();
  }, [dispatch, router]);

  return null; // No UI needed for this component
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null; // Prevent rendering until fonts are loaded
  }

  return (
    <Provider store={store}>
      <UserLoader />
      <Stack
        screenOptions={{
          headerShown: false,
          animationEnabled: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="screens/Blueprint/blueprintPage" />
        <Stack.Screen name="screens/Material/materialPage" />
        <Stack.Screen name="screens/Progress/progressPage" />
        <Stack.Screen name="screens/Project/projectPage" />
        <Stack.Screen name="screens/Material/materialSubPage" />
        <Stack.Screen name="screens/Setting/settingPage" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </Provider>
  );
}
