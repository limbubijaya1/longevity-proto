import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const PdfViewer = ({ uri }) => {
  return (
    <View style={styles.container}>
      <WebView source={{ uri }} style={{ flex: 1 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PdfViewer;
