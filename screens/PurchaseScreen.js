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
import { ref, push, onValue } from "firebase/database";
import { database } from "../config/firebaseConfig";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const Stack = createStackNavigator();

const PurchaseScreen = ({ navigation }) => {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

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
  }, []);

  const handleSavePurchase = () => {
    if (!selectedVendor || !selectedProduct || !quantity) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }

    push(ref(database, "purchases"), {
      vendor: selectedVendor,
      product: selectedProduct,
      quantity,
      datePurchased: purchaseDate.toISOString().split("T")[0],
    });

    setSelectedVendor("");
    setSelectedProduct("");
    setQuantity("");
    setPurchaseDate(new Date());
    Alert.alert("Success", "Purchase recorded successfully!");
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
        <Text style={styles.buttonText}>Save Purchase</Text>
      </TouchableOpacity>
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
});

export default PurchaseScreen;
