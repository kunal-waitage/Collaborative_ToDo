import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  remove,
  update,
  get,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBLvv0XXeS4D7Vd6h9ygER0sru8HpzTt9Q",
  authDomain: "to-doapp-69759.firebaseapp.com",
  databaseURL:
    "https://to-doapp-69759-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "to-doapp-69759",
  storageBucket: "to-doapp-69759.firebasestorage.app",
  messagingSenderId: "870425183994",
  appId: "1:870425183994:web:4172b921b5fd60ce25eb43",
  measurementId: "G-X35JR8K2SN",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export {
  app,
  db,
  auth,
  ref,
  push,
  set,
  onValue,
  remove,
  update,
  get,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
};
