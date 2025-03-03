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
import { DataTable } from "react-native-paper";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import { ref, push, update, remove, onValue } from "firebase/database";
import { database } from "../config/firebaseConfig";
import { ScrollView } from "react-native-gesture-handler";

const Stack = createStackNavigator();

const CustomerEntryScreen = ({ navigation, route }) => {
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (route.params?.customer) {
      const { id, name, contactNumber, address } = route.params.customer;
      setName(name);
      setContactNumber(contactNumber);
      setAddress(address);
      setEditingId(id);
    }
  }, [route.params]);

  const handleAddOrUpdateCustomer = () => {
    if (!name || !contactNumber || !address) return;
    if (editingId) {
      update(ref(database, `customers/${editingId}`), {
        name,
        contactNumber,
        address,
      });
      setEditingId(null);
    } else {
      push(ref(database, "customers"), {
        name,
        contactNumber,
        address,
      });
    }
    setName("");
    setContactNumber("");
    setAddress("");
    Alert.alert("Success", "Customer has been saved successfully");
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
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
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleAddOrUpdateCustomer}
      >
        <Text style={styles.buttonText}>
          {editingId ? "Update Customer" : "Add Customer"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate("CustomerTable")}
      >
        <Text style={styles.buttonText}>View Customers</Text>
      </TouchableOpacity>
    </View>
  );
};

const CustomerTableScreen = ({ navigation }) => {
  const [customers, setCustomers] = useState([]);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortAscending, setSortAscending] = useState(true);

  useEffect(() => {
    const customerRef = ref(database, "customers");
    onValue(customerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const customerArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setCustomers(customerArray);
      } else {
        setCustomers([]);
      }
    });
  }, []);

  const handleEdit = (customer) => {
    navigation.navigate("CustomerEntry", { customer });
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm", "Are you sure you want to delete this customer?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => remove(ref(database, `customers/${id}`)),
        style: "destructive",
      },
    ]);
  };

  const handleSort = (column) => {
    setSortAscending(sortColumn === column ? !sortAscending : true);
    setSortColumn(column);
    setCustomers(
      [...customers].sort((a, b) => {
        if (a[column] < b[column]) return sortAscending ? -1 : 1;
        if (a[column] > b[column]) return sortAscending ? 1 : -1;
        return 0;
      })
    );
  };

  return (
    <ScrollView horizontal={true}>
      <View style={styles.container}>
        <DataTable style={{ minWidth: 400 }}>
          <DataTable.Header>
            <DataTable.Title onPress={() => handleSort("name")}>
              Name{" "}
              {sortColumn == "name" && (
                <MaterialCommunityIcons
                  name={sortAscending ? "arrow-up" : "arrow-down"}
                  size={16}
                />
              )}
            </DataTable.Title>
            <DataTable.Title onPress={() => handleSort("contactNumber")}>
              Contact Number{" "}
              {sortColumn == "contactNumber" && (
                <MaterialCommunityIcons
                  name={sortAscending ? "arrow-up" : "arrow-down"}
                  size={16}
                />
              )}
            </DataTable.Title>
            <DataTable.Title onPress={() => handleSort("address")}>
              Address{" "}
              {sortColumn == "address" && (
                <MaterialCommunityIcons
                  name={sortAscending ? "arrow-up" : "arrow-down"}
                  size={16}
                />
              )}
            </DataTable.Title>
            <DataTable.Title>Actions</DataTable.Title>
          </DataTable.Header>
          {customers.map((customer) => (
            <DataTable.Row key={customer.id}>
              <DataTable.Cell>{customer.name}</DataTable.Cell>
              <DataTable.Cell>{customer.contactNumber}</DataTable.Cell>
              <DataTable.Cell>{customer.address}</DataTable.Cell>
              <DataTable.Cell style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={() => handleEdit(customer)}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color="blue"
                    style={{ marginRight: 10 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(customer.id)}>
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

export default function CustomerScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CustomerEntry"
        component={CustomerEntryScreen}
        options={{ title: "Add Customer" }}
      />
      <Stack.Screen
        name="CustomerTable"
        component={CustomerTableScreen}
        options={{ title: "Customer List" }}
      />
    </Stack.Navigator>
  );
}
