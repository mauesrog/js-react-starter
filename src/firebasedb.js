import firebase from 'firebase';

const config = {
  apiKey: 'AIzaSyDg2Cln8q-nIfiV5eK46sqILikGbNvnyos',
  authDomain: 'react-hw-3.firebaseapp.com',
  databaseURL: 'https://react-hw-3.firebaseio.com',
  storageBucket: '',
};

firebase.initializeApp(config);

function addNote(data) {
  const newData = {};
  const newPostKey = firebase.database().ref('users').push().key;

  newData[`/mauesrog/noteboard/${newPostKey}`] = data;

  firebase.database().ref('users').update(newData);

  return newPostKey;
}

function update(updateData) {
  console.log(updateData);
  firebase.database().ref().update(updateData);
}

const exports = { firebase, addNote, update };

export default exports;
