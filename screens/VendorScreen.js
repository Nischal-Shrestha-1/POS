import React from "react";
import { View, Text, StyleSheet } from "react-native";

const VendorScreen = () => {
  return (
    <View style={styles.screen}>
      <Text>Vendor</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default VendorScreen;
