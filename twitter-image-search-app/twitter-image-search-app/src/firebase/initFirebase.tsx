import firebase from "firebase";

// Firebaseの初期化
const firebaseConfig = {
  apiKey: "AIzaSyD41XT4M7VRvBjTFOTZCaVMedPT-tJa-9M",
  authDomain: "twitter-image-search-app.firebaseapp.com",
  projectId: "twitter-image-search-app",
  storageBucket: "twitter-image-search-app.appspot.com",
  messagingSenderId: "448838636236",
  appId: "1:448838636236:web:f59db52d20129d1e226869",
  measurementId: "G-K6CYNEC6F9"
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}
