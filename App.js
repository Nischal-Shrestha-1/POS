import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { onAuthStateChanged } from "firebase/auth";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import DashboardScreen from "./screens/DashboardScreen";
import ProductScreen from "./screens/ProductScreen";
import VendorScreen from "./screens/VendorScreen";
import CustomerScreen from "./screens/CustomerScreen";
import LocationScreen from "./screens/LocationScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { auth } from "./config/firebaseConfig";
import LogoutScreen from "./screens/LogoutScreen";
import PurchaseScreen from "./screens/PurchaseScreen";
import SellScreen from "./screens/SellScreen";
import SellBulkScreen from "./screens/SellBulkScreen";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerStack = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Product"
        component={ProductScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="package" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Vendor"
        component={VendorScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="shopping" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Customer"
        component={CustomerScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="human-dolly"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Purchase"
        component={PurchaseScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="truck-fast" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="POS"
        component={SellScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="cash-register"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Sell"
        component={SellBulkScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="cash" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Location/Branch"
        component={LocationScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="pin" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="cog" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Logout"
        component={LogoutScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="logout" size={24} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Drawer" component={DrawerStack} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
