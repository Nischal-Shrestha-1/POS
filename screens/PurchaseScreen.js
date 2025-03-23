import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ref, push, onValue, remove, update } from "firebase/database";
import { database } from "../config/firebaseConfig";
import { DataTable } from "react-native-paper";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import { ScrollView } from "react-native-gesture-handler";

const PurchaseScreen = ({ navigation }) => {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);

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
      }
    });

    const productRef = ref(database, "products");
    onValue(productRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setProducts(productArray);
      }
    });

    const purchaseRef = ref(database, "purchases");
    onValue(purchaseRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const purchaseArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setPurchases(purchaseArray);
      }
    });
  }, []);

  const handleSavePurchase = () => {
    if (!selectedVendor || !selectedProduct || !quantity) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }

    if (editingPurchaseId) {
      // If we are editing an existing purchase
      update(ref(database, `purchases/${editingPurchaseId}`), {
        vendor: selectedVendor,
        product: selectedProduct,
        quantity,
        datePurchased: purchaseDate.toISOString().split("T")[0],
      })
        .then(() => {
          setEditingPurchaseId(null);
          Alert.alert("Success", "Purchase updated successfully!");
        })
        .catch((error) => {
          Alert.alert("Error", error.message);
        });
    } else {
      // If it's a new purchase
      push(ref(database, "purchases"), {
        vendor: selectedVendor,
        product: selectedProduct,
        quantity,
        datePurchased: purchaseDate.toISOString().split("T")[0],
      })
        .then(() => {
          Alert.alert("Success", "Purchase recorded successfully!");
        })
        .catch((error) => {
          Alert.alert("Error", error.message);
        });
    }

    // Reset form
    setSelectedVendor("");
    setSelectedProduct("");
    setQuantity("");
    setPurchaseDate(new Date());
  };

  const handleDeletePurchase = (purchaseId) => {
    remove(ref(database, `purchases/${purchaseId}`))
      .then(() => {
        setPurchases(
          purchases.filter((purchase) => purchase.id !== purchaseId)
        );
        Alert.alert("Success", "Purchase deleted successfully!");
      })
      .catch((error) => Alert.alert("Error", error.message));
  };

  const handleEditPurchase = (purchase) => {
    setSelectedVendor(purchase.vendor);
    setSelectedProduct(purchase.product);
    setQuantity(purchase.quantity);
    setPurchaseDate(new Date(purchase.datePurchased));
    setEditingPurchaseId(purchase.id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Vendor:</Text>
      <Picker
        selectedValue={selectedVendor}
        onValueChange={(itemValue) => setSelectedVendor(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Vendor" value="" />
        {vendors.map((vendor) => (
          <Picker.Item
            key={vendor.id}
            label={vendor.companyName}
            value={vendor.companyName}
          />
        ))}
      </Picker>

      <Text style={styles.label}>Select Product:</Text>
      <Picker
        selectedValue={selectedProduct}
        onValueChange={(itemValue) => setSelectedProduct(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Product" value="" />
        {products.map((product) => (
          <Picker.Item
            key={product.id}
            label={product.productName}
            value={product.productName}
          />
        ))}
      </Picker>

      <Text style={styles.label}>Quantity:</Text>
      <TextInput
        placeholder="Enter quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Date Purchased:</Text>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        <Text style={styles.dateText}>{purchaseDate.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={purchaseDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setPurchaseDate(selectedDate);
          }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSavePurchase}>
        <Text style={styles.buttonText}>
          {editingPurchaseId ? "Update Purchase" : "Save Purchase"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Purchase Details:</Text>
      <ScrollView horizontal={true}>
        <DataTable>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title>Vendor</DataTable.Title>
            <DataTable.Title>Product</DataTable.Title>
            <DataTable.Title>Quantity</DataTable.Title>
            <DataTable.Title>Date Purchased</DataTable.Title>
            <DataTable.Title>Edit</DataTable.Title>
            <DataTable.Title>Delete</DataTable.Title>
          </DataTable.Header>

          {purchases.map((purchase) => (
            <DataTable.Row key={purchase.id}>
              <DataTable.Cell style={styles.tableCell}>
                {purchase.vendor}
              </DataTable.Cell>
              <DataTable.Cell style={styles.tableCell}>
                {purchase.product}
              </DataTable.Cell>
              <DataTable.Cell style={styles.tableCell}>
                {purchase.quantity}
              </DataTable.Cell>
              <DataTable.Cell style={styles.tableCell}>
                {new Date(purchase.datePurchased).toDateString()}
              </DataTable.Cell>
              <DataTable.Cell style={styles.tableCell}>
                <TouchableOpacity onPress={() => handleEditPurchase(purchase)}>
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={24}
                    color="blue"
                  />
                </TouchableOpacity>
              </DataTable.Cell>
              <DataTable.Cell>
                <TouchableOpacity
                  onPress={() => handleDeletePurchase(purchase.id)}
                >
                  <MaterialCommunityIcons
                    name="delete-outline"
                    size={24}
                    color="red"
                  />
                </TouchableOpacity>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 16, marginBottom: 5 },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#000",
  },
  button: {
    backgroundColor: "#6200ee",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  tableHeader: { paddingHorizontal: 30, paddingVertical: 12 },
  tableCell: { paddingHorizontal: 30, paddingVertical: 12 },
});

export default PurchaseScreen;
