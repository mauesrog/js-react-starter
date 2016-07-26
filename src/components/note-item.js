import React, { Component } from 'react';
import Draggable from 'react-draggable';
import marked from 'marked';

class NoteItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      markdownClass: 'note-body normal',
      inputClass: 'note-body normal',
      dragClass: 'fa fa-arrows',
      temporalZIndex: 0,
    };

    this.onStart = this.onStart.bind(this);
    this.onStop = this.onStop.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.checkTitle = this.checkTitle.bind(this);
  }

  onStart(e, ui) {
    const draggedElement = e.target.parentElement.parentElement;
    const temporalZIndex = draggedElement.style.zIndex;

    draggedElement.style.zIndex = 100;

    this.setState({ temporalZIndex });
    this.props.onNoteClicked(this.props.id, this.state.zIndex);
  }

  onStop(e, ui) {
    const draggedElement = e.target.parentElement.parentElement;

    this.setState({
      dragClass: 'fa fa-arrows',
    });

    this.props.onPositionChange(this.props.id, [ui.x, ui.y]);
    draggedElement.style.zIndex = this.state.temporalZIndex;
  }

  onEdit() {
    const input = document.getElementById(`note-body-text-${this.props.id}`);

    let inputClass;

    if (this.state.inputClass === 'note-body normal') {
      input.focus();
      inputClass = 'note-body editing';
    } else {
      input.blur();
      inputClass = 'note-body normal';
      this.props.onBodyChange(this.props.id, input.value);
    }

    this.setState({
      inputClass,
      markdownClass: inputClass,
    });
  }

  checkTitle() {
    if (this.props.value.title) {
      return (
        <Draggable
          handle="#drag"
          position={{ x: this.props.value.position[0], y: this.props.value.position[1] }}
          onStart={this.onStart}
          onDrag={this.onDrag}
          onStop={this.onStop}
        >
          <div id={this.props.id} className="note" style={{
            width: `${this.props.value.width}px`,
            zIndex: this.props.value.currentZIndex,
          }}
            onClick={(e) => { this.props.onNoteClicked(this.props.id, this.props.value.currentZIndex); }}
          >
            <div className="note-header">
              <div className="left-icons">
                <h1>{this.props.value.title}</h1>
                <i className="fa fa-trash-o" onClick={(e) => {
                  e.stopPropagation();
                  this.props.onNoteDeleted(this.props.id, this.props.value.currentZIndex);
                }} aria-hidden="true" id="delete"
                />
                <i className="fa fa-pencil" onClick={this.onEdit} aria-hidden="true" id="edit" />
              </div>
              <i className={this.state.dragClass} aria-hidden="true" id="drag" />
            </div>
            <div id={`note-body-${this.props.id}`} className={this.state.markdownClass} dangerouslySetInnerHTML={{ __html: marked(this.props.value.body || '') }} />
            <textarea id={`note-body-text-${this.props.id}`} className={this.state.inputClass} />
          </div>
        </Draggable>
      );
    }

    return null;
  }

  render() {
    return this.checkTitle();
  }
}

export default NoteItem;
