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

const ProductEntryScreen = ({ navigation, route }) => {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (route.params?.product) {
      const { id, productName, quantity, price, unit, description } =
        route.params.product;
      setProductName(productName);
      setQuantity(quantity);
      setPrice(price);
      setUnit(unit);
      setDescription(description);
      setEditingId(id);
    }
  }, [route.params]);

  const handleAddOrUpdateProduct = () => {
    if (!productName || !quantity || !price || !unit) return;
    if (editingId) {
      update(ref(database, `products/${editingId}`), {
        productName,
        quantity,
        price,
        unit,
        description,
      });
      setEditingId(null);
    } else {
      push(ref(database, "products"), {
        productName,
        quantity,
        price,
        unit,
        description,
      });
    }
    setProductName("");
    setQuantity("");
    setPrice("");
    setUnit("");
    setDescription("");
    Alert.alert("Success", "Product has been saved successfully");
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Product Name"
        value={productName}
        onChangeText={setProductName}
        style={styles.input}
      />
      <TextInput
        placeholder="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Unit"
        value={unit}
        onChangeText={setUnit}
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleAddOrUpdateProduct}
      >
        <Text style={styles.buttonText}>
          {editingId ? "Update Product" : "Add Product"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate("ProductTable")}
      >
        <Text style={styles.buttonText}>View Products</Text>
      </TouchableOpacity>
    </View>
  );
};

const ProductTableScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [sortColumn, setSortColumn] = useState("productName");
  const [sortAscending, setSortAscending] = useState(true);

  useEffect(() => {
    const productRef = ref(database, "products");
    onValue(productRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setProducts(productArray);
      } else {
        setProducts([]);
      }
    });
  }, []);

  const handleEdit = (product) => {
    navigation.navigate("ProductEntry", { product });
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm", "Are you sure you want to delete this product?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => remove(ref(database, `products/${id}`)),
        style: "destructive",
      },
    ]);
  };

  const handleSort = (column) => {
    setSortAscending(sortColumn === column ? !sortAscending : true);
    setSortColumn(column);
    setProducts(
      [...products].sort((a, b) => {
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
            <DataTable.Title onPress={() => handleSort("productName")}>
              Product Name{" "}
              {sortColumn == "productName" && (
                <MaterialCommunityIcons
                  name={sortAscending ? "arrow-up" : "arrow-down"}
                  size={16}
                />
              )}
            </DataTable.Title>
            <DataTable.Title onPress={() => handleSort("quantity")}>
              Quantity{" "}
              {sortColumn == "quantity" && (
                <MaterialCommunityIcons
                  name={sortAscending ? "arrow-up" : "arrow-down"}
                  size={16}
                />
              )}
            </DataTable.Title>
            <DataTable.Title onPress={() => handleSort("price")}>
              Price{" "}
              {sortColumn == "price" && (
                <MaterialCommunityIcons
                  name={sortAscending ? "arrow-up" : "arrow-down"}
                  size={16}
                />
              )}
            </DataTable.Title>
            <DataTable.Title>Unit</DataTable.Title>
            <DataTable.Title>Actions</DataTable.Title>
          </DataTable.Header>
          {products.map((product) => (
            <DataTable.Row key={product.id}>
              <DataTable.Cell>{product.productName}</DataTable.Cell>
              <DataTable.Cell>{product.quantity}</DataTable.Cell>
              <DataTable.Cell>{product.price}</DataTable.Cell>
              <DataTable.Cell>{product.unit}</DataTable.Cell>
              <DataTable.Cell style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={() => handleEdit(product)}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color="blue"
                    style={{ marginRight: 10 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(product.id)}>
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

export default function ProductScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProductEntry"
        component={ProductEntryScreen}
        options={{ title: "Add Product" }}
      />
      <Stack.Screen
        name="ProductTable"
        component={ProductTableScreen}
        options={{ title: "Product List" }}
      />
    </Stack.Navigator>
  );
}
