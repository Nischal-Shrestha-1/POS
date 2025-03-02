import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { DataTable } from "react-native-paper";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import { ref, push, update, remove, onValue } from "firebase/database";
import { database } from "../config/firebaseConfig";
import { ScrollView } from "react-native-gesture-handler";

const Stack = createStackNavigator();

const VendorEntryScreen = ({ navigation, route }) => {
  const [companyName, setCompanyName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [contractExpiry, setContractExpiry] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (route.params?.vendor) {
      const {
        id,
        companyName,
        contactNumber,
        location,
        address,
        contractExpiry,
      } = route.params.vendor;
      setCompanyName(companyName);
      setContactNumber(contactNumber);
      setLocation(location);
      setAddress(address);
      setContractExpiry(contractExpiry);
      setEditingId(id);
    }
  }, [route.params]);

  const handleAddOrUpdateVendor = () => {
    if (
      !companyName ||
      !contactNumber ||
      !location ||
      !address ||
      !contractExpiry
    )
      return;
    if (editingId) {
      update(ref(database, `vendors/${editingId}`), {
        companyName,
        contactNumber,
        location,
        address,
        contractExpiry,
      });
      setEditingId(null);
    } else {
      push(ref(database, "vendors"), {
        companyName,
        contactNumber,
        location,
        address,
        contractExpiry,
      });
    }
    setCompanyName("");
    setContactNumber("");
    setLocation("");
    setAddress("");
    setContractExpiry("");
    Alert.alert("Success", "Vendor has been saved successfully");
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Company Name"
        value={companyName}
        onChangeText={setCompanyName}
        style={styles.input}
      />
      <TextInput
        placeholder="Contact Number"
        value={contactNumber}
        onChangeText={setContactNumber}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />
      <TextInput
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />
      <TextInput
        placeholder="Contract Expiry Date"
        value={contractExpiry}
        onChangeText={setContractExpiry}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddOrUpdateVendor}>
        <Text style={styles.buttonText}>
          {editingId ? "Update Vendor" : "Add Vendor"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate("VendorTable")}
      >
        <Text style={styles.buttonText}>View Vendors</Text>
      </TouchableOpacity>
    </View>
  );
};

const VendorTableScreen = ({ navigation }) => {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    const vendorRef = ref(database, "vendors");
    onValue(vendorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const vendorArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setVendors(vendorArray);
      } else {
        setVendors([]);
      }
    });
  }, []);

  const handleEdit = (vendor) => {
    navigation.navigate("VendorEntry", { vendor });
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm", "Are you sure you want to delete this vendor?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => remove(ref(database, `vendors/${id}`)),
        style: "destructive",
      },
    ]);
  };

  return (
    <ScrollView horizontal={true}>
      <View style={styles.container}>
        <DataTable style={{ minWidth: 400 }}>
          <DataTable.Header>
            <DataTable.Title>Company Name</DataTable.Title>
            <DataTable.Title>Contact Number</DataTable.Title>
            <DataTable.Title>Contract Expiry</DataTable.Title>
            <DataTable.Title>Actions</DataTable.Title>
          </DataTable.Header>
          {vendors.map((vendor) => (
            <DataTable.Row key={vendor.id}>
              <DataTable.Cell>{vendor.companyName}</DataTable.Cell>
              <DataTable.Cell>{vendor.contactNumber}</DataTable.Cell>
              <DataTable.Cell>{vendor.contractExpiry}</DataTable.Cell>
              <DataTable.Cell style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={() => handleEdit(vendor)}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color="blue"
                    style={{ marginRight: 10 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(vendor.id)}>
                  <MaterialCommunityIcons name="delete" size={20} color="red" />
                </TouchableOpacity>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  button: {
    backgroundColor: "#6200ee",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonSecondary: {
    backgroundColor: "#03dac6",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default function VendorScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="VendorEntry"
        component={VendorEntryScreen}
        options={{ title: "Add Vendor" }}
      />
      <Stack.Screen
        name="VendorTable"
        component={VendorTableScreen}
        options={{ title: "Vendor List" }}
      />
    </Stack.Navigator>
  );
}
