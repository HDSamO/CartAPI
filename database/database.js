import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyDJfrVMQdjIvmz2qniSMYggdMAK3nIejfg",
  authDomain: "smart-cart-67743.firebaseapp.com",
  databaseURL: "https://smart-cart-67743-default-rtdb.firebaseio.com",
  projectId: "smart-cart-67743",
  storageBucket: "smart-cart-67743.appspot.com",
  messagingSenderId: "691771301391",
  appId: "1:691771301391:web:bf6239bc7e44af72050d7a",
  measurementId: "G-LG2555R5VZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export {database};