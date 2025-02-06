import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBKirrsJmAf_PyqZk7FCLPh28Zit4Z9Osw",
  authDomain: "info-6134-pos-project.firebaseapp.com",
  databaseURL: "https://info-6134-pos-project-default-rtdb.firebaseio.com",
  projectId: "info-6134-pos-project",
  storageBucket: "info-6134-pos-project.firebasestorage.app",
  messagingSenderId: "966769055176",
  appId: "1:966769055176:web:2e0101881c815d233a1cfd",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const database = getDatabase(app);

export { auth, database };
