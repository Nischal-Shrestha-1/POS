import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import { DataTable } from "react-native-paper";
import { ref, push, update, remove, onValue } from "firebase/database";
import { database } from "../config/firebaseConfig";

const LocationScreen = () => {
  const [locations, setLocations] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const locationRef = ref(database, "locations");
    onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const locationsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setLocations(locationsArray);
      } else {
        setLocations([]);
      }
    });
  }, []);

  const handleAddOrUpdateLocation = () => {
    if (locationName.trim() === "") return;
    const locationRef = ref(database, "locations");
    if (editingId) {
      update(ref(database, `locations/${editingId}`), { name: locationName });
      setEditingId(null);
    } else {
      push(locationRef, { name: locationName });
    }
    setLocationName("");
  };

  const handleEdit = (id, name) => {
    setLocationName(name);
    setEditingId(id);
  };

  const handleDelete = (id) => {
    remove(ref(database, `locations/${id}`));
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Enter Location Name"
        value={locationName}
        onChangeText={setLocationName}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <Button
        title={editingId ? "Update Location" : "Add Location"}
        onPress={handleAddOrUpdateLocation}
      />
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Location Name</DataTable.Title>
          <DataTable.Title>Actions</DataTable.Title>
        </DataTable.Header>
        {locations.map((location) => (
          <DataTable.Row key={location.id}>
            <DataTable.Cell>{location.name}</DataTable.Cell>
            <DataTable.Cell>
              <TouchableOpacity
                onPress={() => handleEdit(location.id, location.name)}
              >
                <Text style={{ color: "blue", marginRight: 10 }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(location.id)}>
                <Text style={{ color: "red" }}>Delete</Text>
              </TouchableOpacity>
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
    </View>
  );
};

export default LocationScreen;
