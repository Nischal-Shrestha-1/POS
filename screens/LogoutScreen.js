import React from "react";
import { View, Button, StyleSheet } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { Card, Title } from "react-native-paper";

const LogoutScreen = () => {

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Title style={styles.title}>Are you sure you want to log out?</Title>
        <Button title="Log Out" onPress={handleLogout} />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "80%",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  title: {
    marginBottom: 20,
  },
});

export default LogoutScreen;
