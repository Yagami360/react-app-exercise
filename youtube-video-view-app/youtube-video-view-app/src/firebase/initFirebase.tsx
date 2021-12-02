import firebase from "firebase";

// Firebaseの初期化
const firebaseConfig = {
  apiKey: "AIzaSyAQUtKYmmYjJayszrI1jLMY_-QZLkh-ahk",
  authDomain: "video-view-app-684c0.firebaseapp.com",
  projectId: "video-view-app-684c0",
  storageBucket: "video-view-app-684c0.appspot.com",
  messagingSenderId: "294258558141",
  appId: "1:294258558141:web:9ea7f495bcd5151c2ce3d4",
  measurementId: "G-51R69RDYW3"
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}
