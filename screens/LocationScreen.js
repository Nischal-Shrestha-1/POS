// /screens/DashboardScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const LocationScreen = () => {
  return (
    <View style={styles.screen}>
      <Text>Location</Text>
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

export default LocationScreen;
