import firebase from "firebase";

// Firebaseの初期化
const firebaseConfig = {
  apiKey: "AIzaSyB11yYJsPdL26WdYz87tGDREax89Fb6k_Y",
  authDomain: "video-view-app-73d21.firebaseapp.com",
  projectId: "video-view-app-73d21",
  storageBucket: "video-view-app-73d21.appspot.com",
  messagingSenderId: "162906543737",
  appId: "1:162906543737:web:8b3ab6c98ecc04116c26a8",
  measurementId: "G-TYSW7TK3P2"
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}
