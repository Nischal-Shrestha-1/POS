import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PurchaseScreen = () => {
  return (
    <View style={styles.screen}>
      <Text>Purchase</Text>
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

export default PurchaseScreen;
