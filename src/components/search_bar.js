import React, { Component } from 'react';

class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchterm: '',
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onInputSubmit = this.onInputSubmit.bind(this);
  }
  onInputChange(event) {
    this.setState({ searchterm: event.target.value });
  }

  onInputSubmit(event) {
    this.setState({ searchterm: '' });
    this.props.onNoteTitleSelected(this.state.searchterm);
  }

  render() {
    return (
      <div id="search-bar">
        <input type="text" value={this.state.searchterm} placeholder="Add new note" onChange={this.onInputChange} />
        <input type="submit" value="Add" onClick={this.onInputSubmit} disabled={!this.state.searchterm} />
      </div>
    );
  }
}

export default SearchBar;
