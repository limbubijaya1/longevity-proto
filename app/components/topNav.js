import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Touchable,
  TouchableOpacity,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { setLanguage } from "../../features/language/languageSlice";

export default function TopNav() {
  const fullName = useSelector((state) => state.user.fullName);
  const currentLanguage = useSelector((state) => state.language.language);
  const router = useRouter();
  const dispatch = useDispatch();

  const signin = () => {
    router.push("screens/Auth/signin");
  };

  const navigateToSettings = () => {
    router.push("screens/Setting/settingPage");
  };

  return (
    <View style={styles.navBar}>
      <View style={styles.leftIcons}>
        {/* <FontAwesome5 name="bars" size={22} style={{ paddingRight: 15 }} /> */}
        <TouchableOpacity onPress={signin}>
          <FontAwesome5 name="user-circle" size={22} />
        </TouchableOpacity>
        <Text style={styles.name}>{fullName}</Text>
      </View>
      <View style={styles.rightIcons}>
        <FontAwesome5 name="bell" size={22} style={{ paddingRight: 15 }} />
        <TouchableOpacity onPress={navigateToSettings}>
          <Ionicons name="settings-sharp" size={22} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  navBar: {
    marginHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftIcons: {
    alignItems: "center",
    flexDirection: "row",
  },
  rightIcons: {
    alignItems: "center",
    flexDirection: "row",
  },
  name: {
    paddingLeft: 8,
    alignItems: "center",
    fontSize: 18,
    fontStyle: "italic",
  },
});
