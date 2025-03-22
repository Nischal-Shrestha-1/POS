import React from "react";
import { View, Text, StyleSheet } from "react-native";

const SellScreen = () => {
  return (
    <View style={styles.screen}>
      <Text>Sell</Text>
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

export default SellScreen;
