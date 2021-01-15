import * as firebase from 'firebase'
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyDVKogE5GzGW2FSAZbzzuH5WGLwxnzLVR0",
    authDomain: "wily-58832.firebaseapp.com",
    projectId: "wily-58832",
    storageBucket: "wily-58832.appspot.com",
    messagingSenderId: "80451589137",
    appId: "1:80451589137:web:9b7fd0a76d3bdd74dfcdb0"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()