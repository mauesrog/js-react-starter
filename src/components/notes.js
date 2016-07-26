import React, { Component } from 'react';
import NoteItem from './note-item.js';
import NoteUtils from '../utils/note-utils.js';

// example class based component (smart component)
class Notes extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sidemenuClass: 'submenu normal',
      noteboardMenuClass: 'submenu normal',
      history: [],
      historyIndex: 0,
    };

    this.onNoteAdd = this.onNoteAdd.bind(this);
    this.onNoteDeleted = this.onNoteDeleted.bind(this);
    this.onNoteClicked = this.onNoteClicked.bind(this);
    this.getNoteTags = this.getNoteTags.bind(this);
    this.getAvailableNoteboards = this.getAvailableNoteboards.bind(this);
    this.trackOperation = this.trackOperation.bind(this);
    this.goToThePast = this.goToThePast.bind(this);
    this.onPositionChange = this.onPositionChange.bind(this);
    this.onBodyChange = this.onBodyChange.bind(this);
    this.onGrid = this.onGrid.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const width = NoteUtils.getNoteWidth(nextProps.newNoteTitle.length);
    const position = NoteUtils.getNotePosition(width);

    const data = {
      title: nextProps.newNoteTitle,
      currentZIndex: nextProps.noteboardState ? nextProps.noteboardState.currentZIndex : 0,
      body: '',
      width,
      position,
    };

    if (nextProps.newNoteTitle) {
      this.props.onNoteTitleSelected('');
      this.onNoteAdd(data);
    }
  }

  onNoteAdd(data) {
    this.trackOperation('Added note').then(() => {
      this.props.addNote(data);
      this.props.updateDB(null, { currentZIndex: this.props.noteboardState.currentZIndex + 1 });
    });
  }

  onNoteDeleted(id, z) {
    let currentZIndex;

    if (z + 1 === this.props.noteboardState.currentZIndex) {
      currentZIndex = z;
    } else {
      currentZIndex = this.props.noteboardState.currentZIndex;
    }
    this.trackOperation('Deleted note').then(() => {
      this.props.removeNote(id);
      this.props.updateDB(null, { currentZIndex });
    });
  }

  onNoteClicked(id, currentZIndex, callback) {
    const allNotesMap = new Map(Object.entries(this.props.noteboardState.notes));
    let targetZIndex = currentZIndex;

    for (const note of allNotesMap) {
      if (note[1].currentZIndex > targetZIndex) {
        targetZIndex = note[1].currentZIndex;
      }
    }

    if (targetZIndex > currentZIndex) {
      targetZIndex++;

      this.trackOperation('Note brought to front').then(() => {
        this.props.updateDB({ id, attribute: 'currentZIndex' }, targetZIndex);
        this.props.updateDB(null, { currentZIndex: targetZIndex + 1 });
      });
    }
  }

  onPositionChange(id, position) {
    this.trackOperation('Note moved').then(() => {
      this.props.updateDB({ id, attribute: 'position' }, position);
    });
  }

  onBodyChange(id, body) {
    this.trackOperation('Note\'s body changed').then(() => {
      this.props.updateDB({ id, attribute: 'body' }, body);
    });
  }

  onGrid(event) {
    if (this.props.noteboardState.notes) {
      const notes = this.props.noteboardState.notes;
      const windowHeight = window.innerWidth * 40 / 100 + 80;

      const heightNoteLimit = Math.floor((windowHeight) / 260);
      const widthNoteLimit = Math.floor((window.innerWidth - 20) / 260);

      const widthOffset = (window.innerWidth - widthNoteLimit * 260) / (widthNoteLimit + 1);
      const heightOffset = (windowHeight - heightNoteLimit * 260) / (heightNoteLimit + 1);

      const notesMap = new Map(Object.entries(notes)).entries();
      let zIndex = 0;
      let offset = 0;

      let note, data;

      note = notesMap.next();

      this.trackOperation('Grid layout').then(() => {
        while (note.value) {
          for (let x = widthOffset - 5; x < window.innerWidth - 270; x += 255 + widthOffset) {
            for (let y = heightOffset - 5; y < windowHeight - 270; y += 255 + heightOffset) {
              if (note.value) {
                data = note.value[1];

                data.position = [x + offset, y + offset];
                data.currentZIndex = zIndex;

                notes[note.value[0]] = data;
                note = notesMap.next();

                zIndex++;
              }
            }
          }

          offset += 10;
        }

        this.props.updateDB(null, {
          notes,
          currentZIndex: zIndex,
        });
      });
    }
  }

  getNoteTags() {
    if (this.props.noteboardState.notes) {
      return Object.entries(this.props.noteboardState.notes).map(([id, value]) => {
        return (<NoteItem
          onPositionChange={this.onPositionChange}
          trackOperation={this.trackOperation}
          onNoteDeleted={this.onNoteDeleted}
          onNoteClicked={this.onNoteClicked}
          onBodyChange={this.onBodyChange}
          key={id} value={value} id={id}
        />);
      });
    }

    return null;
  }

  getAvailableNoteboards() {
    return this.props.noteboardKeys.map(el => {
      const name = el[1] && el[1].name ? el[1].name : this.props.noteboardState.name;

      return (
        <li
          onClick={() => {
            this.setState({
              history: [],
              historyIndex: 0,
            });

            this.props.changeNoteboard(el[0]);
          }} className={el[0] === this.props.noteboardId ? 'current' : ''} key={el[0]}
        >
        {name}
        </li>
    );
    });
  }

  trackOperation(action) {
    return new Promise((resolve, revoke) => {
      const history = this.state.history.length ? this.state.history.slice(0, this.state.historyIndex) : [];

      let data, duplicatedData;

      history[this.state.historyIndex] = {
        history: this.state.history,
        notes: {},
        currentZIndex: this.props.noteboardState.currentZIndex,
        historyIndex: this.state.historyIndex,
        undoText: this.props.noteboardState.undoText,
      };

      if (this.props.noteboardState.notes) {
        const notesMap = new Map(Object.entries(this.props.noteboardState.notes));

        for (const note of notesMap) {
          data = note[1];

          duplicatedData = {
            position: data.position,
            currentZIndex: data.currentZIndex,
            body: data.body,
            width: data.width,
            title: data.title,
          };

          history[this.state.historyIndex].notes[note[0]] = duplicatedData;
        }
      }

      this.props.updateDB(null, { undoText: action });

      this.setState({
        history,
        historyIndex: this.state.historyIndex + 1,
      });

      resolve();
    });
  }

  goToThePast(e) {
    const previousState = this.state.history[this.state.historyIndex - 1];

    this.props.updateDB(null, {
      notes: previousState.notes ? previousState.notes : null,
      currentZIndex: previousState.currentZIndex,
      undoText: previousState.undoText,
    });

    this.setState({
      historyIndex: previousState.historyIndex,
    });
  }

  render() {
    if (this.props.noteboardState) {
      return (
        <div id="notes">
          <div id="sidemenu" className={this.state.sidemenuClass}>
            <div className="left">
              <div id="undo" className={this.state.historyIndex > 0 ? 'active' : 'unactive'} onClick={this.goToThePast}>
                <div>
                  {`Undo: ${this.props.noteboardState.undoText}`}
                </div>
                <i className="fa fa-undo" aria-hidden="true" />
              </div>
              <i className={this.props.noteboardState.notes ? 'fa fa-th active' : 'fa fa-th unactive'} id="grid" aria-hidden="true" onClick={this.onGrid} />
            </div>
            <i
              className={`fa fa-caret-right ${this.state.sidemenuClass}`} id="sidemenu-toggle"
              onClick={() => { this.setState({ sidemenuClass: this.state.sidemenuClass === 'submenu normal' ? 'submenu active' : 'submenu normal' }); }} aria-hidden="true"
            />
          </div>
          <div id="noteboardMenu" className={this.state.noteboardMenuClass}>
            <i
              className={`fa fa-sticky-note-o ${this.state.noteboardMenuClass}`} id="noteboard-menu-toggle"
              onClick={() => { this.setState({ noteboardMenuClass: this.state.noteboardMenuClass === 'submenu normal' ? 'submenu active' : 'submenu normal' }); }} aria-hidden="true"
            />
            <div className="right">
              <ul>{this.getAvailableNoteboards()}</ul>
              <i
                className="fa fa-plus-circle" aria-hidden="true"
                onClick={this.props.onNewNoteboard}
              />
            </div>
          </div>
          {this.getNoteTags()}
        </div>
      );
    } else {
      return null;
    }
  }
}

export default Notes;
