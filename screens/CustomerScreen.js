import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CustomerScreen = () => {
  return (
    <View style={styles.screen}>
      <Text>Customer</Text>
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

export default CustomerScreen;
