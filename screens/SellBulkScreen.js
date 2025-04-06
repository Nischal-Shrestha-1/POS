import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ref, push, onValue } from "firebase/database";
import { database } from "../config/firebaseConfig";

const SellBulkScreen = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [soldDate, setSoldDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [productSelections, setProductSelections] = useState([]);
  const [currentProduct, setCurrentProduct] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState("");

  useEffect(() => {
    onValue(ref(database, "customers"), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const array = Object.keys(data).map((key) => ({
          id: key,
          name: data[key].name,
        }));
        setCustomers(array);
      }
    });

    onValue(ref(database, "products"), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const array = Object.keys(data).map((key) => ({
          id: key,
          name: data[key].productName,
          price: parseFloat(data[key].price),
        }));
        setProducts(array);
      }
    });
  }, []);

  const addProduct = () => {
    if (!currentProduct || !currentQuantity) {
      Alert.alert("Error", "Please select a product and enter quantity.");
      return;
    }
    const product = products.find((p) => p.id === currentProduct);
    setProductSelections((prev) => [
      ...prev,
      {
        id: currentProduct,
        name: product.name,
        quantity: parseInt(currentQuantity),
        price: product.price,
        total: product.price * parseInt(currentQuantity),
      },
    ]);
    setCurrentProduct("");
    setCurrentQuantity("");
  };

  const handleSubmitSale = () => {
    if (!selectedCustomer || productSelections.length === 0) {
      Alert.alert("Error", "Please select customer and at least one product.");
      return;
    }

    const totalPrice = productSelections.reduce(
      (sum, item) => sum + item.total,
      0
    );

    push(ref(database, "sales"), {
      customer: selectedCustomer,
      products: productSelections,
      soldDate: soldDate.toISOString().split("T")[0],
      totalPrice: totalPrice.toFixed(2),
    })
      .then(() => {
        Alert.alert("Success", "Sale recorded successfully!");
        setSelectedCustomer("");
        setProductSelections([]);
      })
      .catch((error) => Alert.alert("Error", error.message));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Customer:</Text>
      <Picker
        selectedValue={selectedCustomer}
        onValueChange={(value) => setSelectedCustomer(value)}
        style={styles.picker}
      >
        <Picker.Item label="Select Customer" value="" />
        {customers.map((c) => (
          <Picker.Item key={c.id} label={c.name} value={c.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Select Product:</Text>
      <Picker
        selectedValue={currentProduct}
        onValueChange={(value) => setCurrentProduct(value)}
        style={styles.picker}
      >
        <Picker.Item label="Select Product" value="" />
        {products.map((p) => (
          <Picker.Item key={p.id} label={p.name} value={p.id} />
        ))}
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Enter Quantity"
        value={currentQuantity}
        onChangeText={setCurrentQuantity}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.addButton} onPress={addProduct}>
        <Text style={styles.buttonText}>Add Product</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Products in Sale:</Text>
      <FlatList
        data={productSelections}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>
              {item.name} - Qty: {item.quantity}, Total: $
              {item.total.toFixed(2)}
            </Text>
          </View>
        )}
      />

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
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSoldDate(date);
          }}
        />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSubmitSale}>
        <Text style={styles.buttonText}>Submit Sale</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 16, marginVertical: 5 },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    borderRadius: 5,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#6200ee",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  dateText: { fontSize: 16 },
  listItem: {
    padding: 10,
    backgroundColor: "#f1f1f1",
    marginBottom: 5,
    borderRadius: 5,
  },
});

export default SellBulkScreen;
