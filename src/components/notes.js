import React, { Component } from 'react';
import Immutable from 'immutable';
import NoteItem from './note-item.js';
import NoteUtils from '../utils/note-utils.js';

// example class based component (smart component)
class Notes extends Component {
  constructor(props) {
    super(props);

    // init component state here
    this.state = {
      notes: Immutable.Map(),
      currentZIndex: 0,
      historyIndex: 0,
      undoClass: 'unactive',
      undoText: '',
      history: [],
      sidemenuClass: 'normal',
    };

    this.onNoteAdd = this.onNoteAdd.bind(this);
    this.onNoteDeleted = this.onNoteDeleted.bind(this);
    this.onNoteClicked = this.onNoteClicked.bind(this);
    this.getNoteTags = this.getNoteTags.bind(this);
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
      currentZIndex: this.state.currentZIndex,
      body: '',
      width,
      position,
    };

    this.onNoteAdd(data);
  }

  onNoteAdd(data) {
    const id = `${Math.floor(Math.random() * 9999) + 1000}-${this.state.notes.count()}`;

    this.trackOperation('Added new note').then(() => {
      this.setState({
        notes: this.state.notes.set(id, data),
        currentZIndex: this.state.currentZIndex + 1,
      });
    });
  }

  onNoteDeleted(id, z) {
    let currentZIndex;

    if (z + 1 === this.state.currentZIndex) {
      currentZIndex = z;
    } else {
      currentZIndex = this.state.currentZIndex;
    }
    this.trackOperation('Deleted note').then(() => {
      this.setState({
        notes: this.state.notes.delete(id),
        currentZIndex,
      });
    });
  }

  onNoteClicked(id, currentZIndex, callback) {
    const allNotes = this.state.notes.values();

    let targetZIndex = currentZIndex;

    for (const note of allNotes) {
      if (note.currentZIndex > targetZIndex) {
        targetZIndex = note.currentZIndex;
      }
    }

    if (targetZIndex > currentZIndex) {
      targetZIndex++;

      this.trackOperation('Note brought to front').then(() => {
        const data = this.state.notes.get(id);

        data.currentZIndex = targetZIndex;

        this.setState({
          notes: this.state.notes.set(id, data),
          currentZIndex: targetZIndex + 1,
        });
      });
    }
  }

  onPositionChange(id, position) {
    this.trackOperation('Note moved').then(() => {
      const data = this.state.notes.get(id);

      data.position = position;

      this.setState({
        notes: this.state.notes.set(id, data),
      });
    });
  }

  onBodyChange(id, body) {
    this.trackOperation('Note\'s body changed').then(() => {
      const data = this.state.notes.get(id);

      data.body = body;
      this.setState({
        notes: this.state.notes.set(id, data),
      });
    });
  }

  onGrid(event) {
    const numberOfNotes = this.state.notes.count();

    if (numberOfNotes > 0) {
      const windowHeight = window.innerWidth * 40 / 100 + 80;

      const heightNoteLimit = Math.floor((windowHeight) / 260);
      const widthNoteLimit = Math.floor((window.innerWidth - 20) / 260);

      const widthOffset = (window.innerWidth - widthNoteLimit * 260) / (widthNoteLimit + 1);
      const heightOffset = (windowHeight - heightNoteLimit * 260) / (heightNoteLimit + 1);

      const keys = this.state.notes.keys();
      let key = keys.next().value;
      let zIndex = 0;
      let offset = 0;
      let data;

      this.trackOperation('Grid layout').then(() => {
        while (key) {
          for (let x = widthOffset - 5; x < window.innerWidth - 270; x += 255 + widthOffset) {
            for (let y = heightOffset - 5; y < windowHeight - 270; y += 255 + heightOffset) {
              if (key) {
                data = this.state.notes.get(key);

                data.position = [x + offset, y + offset];
                data.currentZIndex = zIndex;

                this.state.notes.set(key, data);

                key = keys.next().value;

                zIndex++;
              }
            }
          }

          offset += 10;
        }

        this.setState({
          notes: this.state.notes,
          currentZIndex: zIndex,
        });
      });
    }
  }

  getNoteTags() {
    if (this.state.notes.count()) {
      return this.state.notes.entrySeq().map(([id, value], i) => {
        return (
          <NoteItem
            onPositionChange={this.onPositionChange}
            trackOperation={this.trackOperation}
            onNoteDeleted={this.onNoteDeleted}
            onNoteClicked={this.onNoteClicked}
            onBodyChange={this.onBodyChange}
            key={id} value={value} id={id}
          />
        );
      });
    }

    return null;
  }

  trackOperation(action) {
    return new Promise((resolve, revoke) => {
      const history = this.state.history.length ? this.state.history.slice(0, this.state.historyIndex) : [];
      let data, duplicatedData;


      history[this.state.historyIndex] = {
        notes: Immutable.Map(),
        undoClass: this.state.undoClass,
        currentZIndex: this.state.currentZIndex,
        historyIndex: this.state.historyIndex,
        history: this.state.history,
        undoText: this.state.undoText,
      };

      for (const key of this.state.notes.keys()) {
        data = this.state.notes.get(key);

        duplicatedData = {
          position: data.position,
          currentZIndex: data.currentZIndex,
          body: data.body,
          width: data.width,
          title: data.title,
        };

        history[this.state.historyIndex].notes = history[this.state.historyIndex].notes.set(key, duplicatedData);
      }

      this.setState({
        history,
        historyIndex: this.state.historyIndex + 1,
        undoText: action,
        undoClass: !history[this.state.historyIndex] ? 'unactive' : 'active',
      });

      resolve();
    });
  }

  goToThePast(e) {
    const previousState = this.state.history[this.state.historyIndex - 1];

    this.setState({
      notes: previousState.notes,
      currentZIndex: previousState.currentZIndex,
      historyIndex: previousState.historyIndex,
      undoText: previousState.undoText,
      undoClass: previousState.undoClass,
    });
  }

  render() {
    return (
      <div id="notes">
        <div id="sidemenu" className={this.state.sidemenuClass}>
          <div className="left">
            <div id="undo" className={this.state.undoClass} onClick={this.goToThePast}>
              <div>
                {`Undo: ${this.state.undoText}`}
              </div>
              <i className="fa fa-undo" aria-hidden="true" />
            </div>
            <i className="fa fa-th" id="grid" aria-hidden="true" onClick={this.onGrid} />
          </div>
          <i
            className={`fa fa-caret-right ${this.state.sidemenuClass}`} id="sidemenu-toggle"
            onClick={() => { this.setState({ sidemenuClass: this.state.sidemenuClass === 'normal' ? 'active' : 'normal' }); }} aria-hidden="true"
          />
        </div>
        {this.getNoteTags()}
      </div>
    );
  }
}

export default Notes;
