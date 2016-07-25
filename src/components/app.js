import React, { Component } from 'react';
import Immutable from 'immutable';

import SearchBar from './search_bar';
import Notes from './notes';
import firebasedb from '../firebasedb.js';

// example class based component (smart component)
class App extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      users: Immutable.Map(),
      newNoteTitle: '',
      noteboardState: null,
    };

    this.onNoteTitleSelected = this.onNoteTitleSelected.bind(this);
    this.onAddNote = this.onAddNote.bind(this);
    this.onNewUpdateDB = this.onNewUpdateDB.bind(this);
  }

  componentDidMount() {
    firebasedb.firebase.database().ref('/users/mauesrog/noteboard').on('value', this.onNewUpdateDB);
  }

  onNewUpdateDB(snapshot) {
    const noteboardState = snapshot.val();
    this.setState({ noteboardState });
  }

  onNoteTitleSelected(newNoteTitle) {
    this.setState({ newNoteTitle });
  }

  onAddNote(data) {
    firebasedb.addNote(data);
  }

  onUpdateDB(recursive, id, data) {
    return new Promise((resolve, revoke) => {
      if (!recursive) {
        firebasedb.update(data);
      }

      resolve(true);
    });
  }

  render() {
    return (
      null
    );
  }
}

export default App;
