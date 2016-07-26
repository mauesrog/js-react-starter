import React, { Component } from 'react';

import SearchBar from './search_bar';
import Notes from './notes';
import firebasedb from '../firebasedb.js';

// example class based component (smart component)
class App extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      newNoteTitle: '',
      noteboardId: '',
      noteboardKeys: [],
      noteboards: {},
      userId: this.props.params.userId,
      necessary: false,
    };

    this.onNoteTitleSelected = this.onNoteTitleSelected.bind(this);
    this.onAddNote = this.onAddNote.bind(this);
    this.onNewUpdateDB = this.onNewUpdateDB.bind(this);
    this.getNoteBoardId = this.getNoteBoardId.bind(this);
    this.onUpdateDB = this.onUpdateDB.bind(this);
    this.onRemoveNote = this.onRemoveNote.bind(this);
    this.onNameSelected = this.onNameSelected.bind(this);
    this.newName = this.newName.bind(this);
  }

  componentDidMount() {
    firebasedb.firebase.database().ref('/users/').once('value')
    .then(snapshot => {
      const users = snapshot.val();

      this.getNoteBoardId(users)
      .then(data => {
        this.setState({
          noteboardId: data.noteboardId,
          noteboardKeys: data.noteboardKeys,
        });

        firebasedb.firebase.database().ref(`/users/${this.state.userId}/noteboards/`).on('value', this.onNewUpdateDB);
      });
    });
  }

  onNewUpdateDB(snapshot) {
    const noteboards = snapshot.val();

    if (this.state.noteboardId && !noteboards[this.state.noteboardId].notes) {
      firebasedb.update(this.state.userId, this.state.noteboardId, null, { currentZIndex: 0, undoText: '' });
    }

    this.setState({ noteboards, noteboardKeys: Object.entries(snapshot.val()) });
  }

  onNoteTitleSelected(newNoteTitle) {
    this.setState({ newNoteTitle });
  }

  onAddNote(data) {
    firebasedb.addNote(this.state.userId, this.state.noteboardId, data);
  }

  onRemoveNote(id) {
    firebasedb.removeNote(this.state.userId, this.state.noteboardId, id);
  }

  onUpdateDB(individual, data) {
    firebasedb.update(this.state.userId, this.state.noteboardId, individual, data);
  }

  onNameSelected(name) {
    if (this.state.noteboardKeys[0][1].name === 'Untitled') {
      firebasedb.updateName(this.state.userId, this.state.noteboardId, name);
    } else {
      firebasedb.addNoteboard(this.state.userId, name);
    }

    this.setState({
      necessary: false,
    });
  }

  getNoteBoardId(users) {
    return new Promise((resolve, revoke) => {
      let noteboardId;

      if (users[this.state.userId]) {
        firebasedb.firebase.database().ref(`/users/${this.state.userId}/noteboards`).once('value')
        .then(snapshotNoteboard => {
          const noteboardKeys = Object.entries(snapshotNoteboard.val());
          noteboardId = noteboardKeys[0][0];

          resolve({ noteboardId, noteboardKeys });
        });
      } else {
        noteboardId = firebasedb.addNoteboard(this.state.userId, 'Untitled').noteboardId;

        this.setState({
          necessary: true,
        });

        resolve({ noteboardId, noteboardKeys: [noteboardId] });
      }
    });
  }


  newName() {
    let popUp;

    if (this.state.necessary) {
      popUp = (
        <div className="pop-up-name screen">
          <div className="box">
            <h1>Type in a name for your new noteboard</h1>
            < SearchBar
              placeholder="Your noteboard name"
              submitValue="Set name"
              onNoteTitleSelected={this.onNameSelected}
            />
          </div>
        </div>
      );
    } else {
      popUp = null;
    }

    return popUp;
  }

  render() {
    return (
      <div id="app">
        <nav>
          < SearchBar
            onNoteTitleSelected={this.onNoteTitleSelected}
            submitValue="Add"
            placeholder="Add new note"
          />
        </nav>
        {this.newName()}
        < Notes
          newNoteTitle={this.state.newNoteTitle}
          onNoteTitleSelected={this.onNoteTitleSelected}
          addNote={this.onAddNote}
          noteboardState={this.state.noteboards[this.state.noteboardId]}
          updateDB={this.onUpdateDB}
          removeNote={this.onRemoveNote}
          noteboardKeys={this.state.noteboardKeys}
          noteboardId={this.state.noteboardId}
          onNewNoteboard={() => { this.setState({ necessary: true }); }}
          changeNoteboard={(noteboardId) => { this.setState({ noteboardId }); }}
        />
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default App;
