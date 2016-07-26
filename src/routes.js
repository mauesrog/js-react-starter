import React, { Component } from 'react';
import { Router, Route, IndexRoute, Link } from 'react-router';
import firebasedb from './firebasedb.js';

import App from './components/app';
import Welcome from './components/welcome';

class MainLayout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      boardsMenuClass: 'unactive',
      currentUserID: '',
    };

    this.onUserLoggedIn = this.onUserLoggedIn.bind(this);
    this.onUserLoggedOut = this.onUserLoggedOut.bind(this);
  }

  onUserLoggedIn(currentUserID) {
    this.setState({
      currentUserID,
      boardsMenuClass: 'active',
    });
  }

  onUserLoggedOut(e) {
    this.setState({
      boardsMenuClass: 'unactive',
    });
    firebasedb.logout();
  }

  render() {
    const boardsText = this.state.boardsMenuClass === 'unactive' ? 'You need to login first!' : 'My boards';

    return (
      <div className="app">
        <header className="primary-header"></header>
        <aside className="primary-aside">
          <ul>
            <li>
              <i className="fa fa-home" aria-hidden="true" />
              <Link to="/">Home</Link>
            </li>
            <li className={this.state.boardsMenuClass}>
              <i className="fa fa-sticky-note-o" aria-hidden="true" />
              <Link to={`/boards/${this.state.currentUserID}`}>{boardsText}</Link>
            </li>
            <li className={this.state.boardsMenuClass}>
              <i className="fa fa-sign-out" aria-hidden="true"></i>
              <Link to={'/'} onClick={this.onUserLoggedOut}>Logout</Link>
            </li>
          </ul>
        </aside>
        <main>
          {this.props.children && React.cloneElement(this.props.children, {
            onUserLoggedIn: this.onUserLoggedIn,
          })}
        </main>
      </div>
    );
  }
}

export default(
  <Router path="/" component={MainLayout}>
    <IndexRoute component={Welcome} />
    <Route path="/boards/:userId" component={App} />
  </Router>
);
