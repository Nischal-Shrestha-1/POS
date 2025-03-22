import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { ref, push, onValue } from "firebase/database";
import { database } from "../config/firebaseConfig";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const SellScreen = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [soldDate, setSoldDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const customerRef = ref(database, "customers");
    onValue(customerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const customerArray = Object.keys(data).map((key) => ({
          id: key,
          name: data[key].name,
        }));
        setCustomers(customerArray);
      }
    });

    const productRef = ref(database, "products");
    onValue(productRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productArray = Object.keys(data).map((key) => ({
          id: key,
          name: data[key].productName,
          price: data[key].price,
        }));
        setProducts(productArray);
      }
    });
  }, []);

  const handleQuantityChange = (qty) => {
    setQuantity(qty);
    if (selectedProduct && qty) {
      const product = products.find((p) => p.id === selectedProduct);
      setPrice(product.price);
      setTotalPrice((product.price * qty).toFixed(2));
    }
  };

  const handleSale = () => {
    if (!selectedCustomer || !selectedProduct || !quantity) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }

    push(ref(database, "sales"), {
      customer: selectedCustomer,
      product: selectedProduct,
      quantity,
      price,
      totalPrice,
      soldDate: soldDate.toISOString().split("T")[0],
    });

    setSelectedCustomer("");
    setSelectedProduct("");
    setQuantity("");
    setPrice("");
    setTotalPrice(0);
    setSoldDate(new Date());
    Alert.alert("Success", "Sale recorded successfully!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Customer:</Text>
      <Picker
        selectedValue={selectedCustomer}
        onValueChange={(itemValue) => setSelectedCustomer(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Customer" value="" />
        {customers.map((customer) => (
          <Picker.Item
            key={customer.id}
            label={customer.name}
            value={customer.id}
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
            label={product.name}
            value={product.id}
          />
        ))}
      </Picker>

      <Text style={styles.label}>Quantity:</Text>
      <TextInput
        placeholder="Enter quantity"
        value={quantity}
        onChangeText={handleQuantityChange}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Price: {price}</Text>

      <Text style={styles.label}>Total Price: {totalPrice}</Text>

      <Text style={styles.label}>Sold Date:</Text>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        <Text style={styles.dateText}>{soldDate.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={soldDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setSoldDate(selectedDate);
          }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSale}>
        <Text style={styles.buttonText}>Save Sale</Text>
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

export default SellScreen;
