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

const SellScreen = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [soldDate, setSoldDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editSale, setEditSale] = useState(null); // To store the sale being edited

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

    const salesRef = ref(database, "sales");
    onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const salesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setSales(salesArray);
      }
    });
  }, []);

  const handleSale = () => {
    if (!selectedCustomer || !selectedProduct || !quantity) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }

    if (editSale) {
      update(ref(database, `sales/${editSale.id}`), {
        customer: selectedCustomer,
        product: selectedProduct,
        quantity,
        price,
        totalPrice,
        soldDate: soldDate.toISOString().split("T")[0],
      })
        .then(() => {
          Alert.alert("Success", "Sale updated successfully!");
          resetForm();
        })
        .catch((error) => Alert.alert("Error", error.message));
    } else {
      push(ref(database, "sales"), {
        customer: selectedCustomer,
        product: selectedProduct,
        quantity,
        price,
        totalPrice,
        soldDate: soldDate.toISOString().split("T")[0],
      })
        .then(() => {
          Alert.alert("Success", "Sale recorded successfully!");
          resetForm();
        })
        .catch((error) => Alert.alert("Error", error.message));
    }
  };

  const handleDeleteSale = (saleId) => {
    remove(ref(database, `sales/${saleId}`))
      .then(() => {
        setSales(sales.filter((sale) => sale.id !== saleId));
        Alert.alert("Success", "Sale deleted successfully!");
      })
      .catch((error) => Alert.alert("Error", error.message));
  };

  const handleEditSale = (sale) => {
    setEditSale(sale);
    setSelectedCustomer(sale.customer);
    setSelectedProduct(sale.product);
    setQuantity(sale.quantity);
    setPrice(sale.price);
    setTotalPrice(sale.totalPrice);
    setSoldDate(new Date(sale.soldDate));
  };

  const handleQuantityChange = (qty) => {
    setQuantity(qty);
    if (selectedProduct && qty) {
      const product = products.find((p) => p.id === selectedProduct);
      setPrice(product.price);
      setTotalPrice((product.price * qty).toFixed(2));
    }
  };

  const resetForm = () => {
    setEditSale(null);
    setSelectedCustomer("");
    setSelectedProduct("");
    setQuantity("");
    setPrice("");
    setTotalPrice(0);
    setSoldDate(new Date());
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
        <Text style={styles.buttonText}>
          {editSale ? "Update Sale" : "Save Sale"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Sales Details:</Text>
      <ScrollView horizontal={true}>
        <DataTable>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title>Customer</DataTable.Title>
            <DataTable.Title>Product</DataTable.Title>
            <DataTable.Title>Quantity</DataTable.Title>
            <DataTable.Title>Total Price</DataTable.Title>
            <DataTable.Title>Sold Date</DataTable.Title>
            <DataTable.Title>Edit</DataTable.Title>
            <DataTable.Title>Delete</DataTable.Title>
          </DataTable.Header>

          {sales.map((sale) => {
            const customer = customers.find(
              (customer) => customer.id === sale.customer
            );
            const product = products.find(
              (product) => product.id === sale.product
            );
            const customerName = customer ? customer.name : "Unknown Customer";
            const productName = product ? product.name : "Unknown Product";

            return (
              <DataTable.Row key={sale.id}>
                <DataTable.Cell style={styles.tableCell}>
                  {customerName}
                </DataTable.Cell>
                <DataTable.Cell style={styles.tableCell}>
                  {productName}
                </DataTable.Cell>
                <DataTable.Cell style={styles.tableCell}>
                  {sale.quantity}
                </DataTable.Cell>
                <DataTable.Cell style={styles.tableCell}>
                  {sale.totalPrice}
                </DataTable.Cell>
                <DataTable.Cell style={styles.tableCell}>
                  {new Date(sale.soldDate).toDateString()}
                </DataTable.Cell>
                <DataTable.Cell style={styles.tableCell}>
                  <TouchableOpacity onPress={() => handleEditSale(sale)}>
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={24}
                      color="blue"
                    />
                  </TouchableOpacity>
                </DataTable.Cell>
                <DataTable.Cell style={styles.tableCell}>
                  <TouchableOpacity onPress={() => handleDeleteSale(sale.id)}>
                    <MaterialCommunityIcons
                      name="delete-outline"
                      size={24}
                      color="red"
                    />
                  </TouchableOpacity>
                </DataTable.Cell>
              </DataTable.Row>
            );
          })}
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
  tableHeader: {
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  tableCell: {
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
});

export default SellScreen;
