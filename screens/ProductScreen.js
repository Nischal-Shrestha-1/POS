import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ProductScreen = () => {
  return (
    <View style={styles.screen}>
      <Text>Product</Text>
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

export default ProductScreen;
