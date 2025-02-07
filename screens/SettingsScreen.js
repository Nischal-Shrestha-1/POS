import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getAuth } from "firebase/auth";
import { ref, set, onValue } from "firebase/database";
import { database } from "../config/firebaseConfig";

const SettingsScreen = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;

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
      }
    });

    if (userId) {
      const userLocationRef = ref(database, `user_locations/${userId}`);
      onValue(userLocationRef, (snapshot) => {
        if (snapshot.exists()) {
          setSelectedLocation(snapshot.val().locationId);
        }
      });
    }
  }, [userId]);

  const handleLocationChange = (locationId) => {
    setSelectedLocation(locationId);
    if (userId) {
      set(ref(database, `user_locations/${userId}`), { locationId });
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Select Location</Text>
      <Picker
        selectedValue={selectedLocation}
        onValueChange={(itemValue) => handleLocationChange(itemValue)}
      >
        <Picker.Item label="Select a location" value={null} />
        {locations.map((location) => (
          <Picker.Item
            key={location.id}
            label={location.name}
            value={location.id}
          />
        ))}
      </Picker>
    </View>
  );
};

export default SettingsScreen;
