import React, { Component } from 'react';
import Immutable from 'immutable';

import SearchBar from './search_bar';
import Notes from './notes';

// example class based component (smart component)
class App extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      users: Immutable.Map(),
      newNoteTitle: '',
    };

    this.onNoteTitleSelected = this.onNoteTitleSelected.bind(this);
  }

  onNoteTitleSelected(newNoteTitle) {
    this.setState({ newNoteTitle });
  }

  render() {
    return (
      <div id="app">
        <nav>
          < SearchBar onNoteTitleSelected={this.onNoteTitleSelected} />
        </nav>
        < Notes newNoteTitle={this.state.newNoteTitle} />
      </div>
    );
  }
}

export default App;
