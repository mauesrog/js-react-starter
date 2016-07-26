import firebase from 'firebase';
import NoteUtils from './utils/note-utils.js';

const config = {
  apiKey: 'AIzaSyDg2Cln8q-nIfiV5eK46sqILikGbNvnyos',
  authDomain: 'react-hw-3.firebaseapp.com',
  databaseURL: 'https://react-hw-3.firebaseio.com',
  storageBucket: '',
};

firebase.initializeApp(config);

function addNote(userId, noteboardId, data) {
  const newData = {};
  const newPostKey = firebase.database().ref('users').push().key;

  newData[`/${userId}/noteboards/${noteboardId}/notes/${newPostKey}`] = data;

  firebase.database().ref('users').update(newData);

  return newPostKey;
}

function addNoteboard(userId, name) {
  const data = {
    currentZIndex: 1,
    undoText: '',
    name,
  };

  const title = name === 'Untitled' ? 'It seems like you\'re new here!' : `New noteboard ${name}`;

  const welcomeNote = {
    body: '![](http://i.makeagif.com/media/6-09-2015/MdEwOO.gif)',
    currentZIndex: 0,
    position: [350, 100],
    width: NoteUtils.getNoteWidth(25),
    title,
  };

  const newData = {};

  const newPostKey = firebase.database().ref('users').push().key;

  newData[`/${userId}/noteboards/${newPostKey}/`] = data;

  firebase.database().ref('users').update(newData);

  return {
    noteboardId: newPostKey,
    noteId: addNote(userId, newPostKey, welcomeNote),
  };
}

function updateName(userId, noteboardId, name) {
  const newData = {};

  newData[`/${userId}/noteboards/${noteboardId}/name`] = name;

  firebase.database().ref('users').update(newData);
}

function update(userId, noteboardId, data, updateData) {
  const dataMap = new Map(Object.entries(updateData));
  const newData = {};

  if (data) {
    newData[`/${userId}/noteboards/${noteboardId}/notes/${data.id}/${data.attribute}`] = updateData;
  } else {
    for (const key of dataMap) {
      newData[`/${userId}/noteboards/${noteboardId}/${key[0]}`] = key[1];
    }
  }

  firebase.database().ref('users').update(newData);
}

function removeNote(userId, noteboardId, id) {
  firebase.database().ref(`users/${userId}/noteboards/${noteboardId}/notes`).child(id)
                                                                            .remove();
}

function facebookAuthorize(callback) {
  const provider = new firebase.auth.FacebookAuthProvider();

  provider.addScope('public_profile');

  firebase.auth().signInWithPopup(provider)
  .then(result => {
    const token = result.credential.accessToken;
    const user = result.user.displayName;

    console.log(`User ${user} successfully connected with token ${token}`);
  })
  .catch(error => {
    console.log(error);
  });
}

function logout() {
  firebase.auth().signOut().then(() => {
    console.log('Successfully logged out!');
  }, error => {
    console.log(error);
  });
}

const exports = { firebase, addNote, updateName, update, addNoteboard, removeNote, facebookAuthorize, logout };

export default exports;
