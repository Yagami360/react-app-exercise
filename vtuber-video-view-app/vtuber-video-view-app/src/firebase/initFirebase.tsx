import firebase from "firebase";

// Firebaseの初期化
const firebaseConfig = {
  apiKey: "AIzaSyBXoM1o56PGQtbiL6jrlan4vy739kU-v_M",
  authDomain: "vtuber-video-view-app-6dd4e.firebaseapp.com",
  projectId: "vtuber-video-view-app-6dd4e",
  storageBucket: "vtuber-video-view-app-6dd4e.appspot.com",
  messagingSenderId: "348124424499",
  appId: "1:348124424499:web:337c3d8ee393206cd2f646",
  measurementId: "G-R2HK9VV7M8"
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}
