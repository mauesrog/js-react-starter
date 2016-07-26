import React, { Component } from 'react';
import firebasedb from '../firebasedb.js';

class Welcome extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUser: null,
      loadedUser: false,
    };

    this.onAuthStateChanged = this.onAuthStateChanged.bind(this);
    this.prepareSignIn = this.prepareSignIn.bind(this);
    this.getSignInPrompt = this.getSignInPrompt.bind(this);
  }

  componentDidMount() {
    firebasedb.firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
  }

  onAuthStateChanged(currentUser) {
    if (currentUser) {
      this.props.onUserLoggedIn(currentUser.uid);
    }

    this.setState({ loadedUser: true, currentUser });
  }


  getSignInPrompt() {
    let content;

    if (this.state.loadedUser) {
      if (!this.state.currentUser) {
        content = [<i className="fa fa-facebook-official" aria-hidden="true" key="fb" />,
          <h1 key="fb-header"> Log in with Facebook </h1>];
      } else {
        content = [<div key="fb" className="facebook-data"><img key="profile-pic" id="profile-pic" src={this.state.currentUser.photoURL} alt="profile" />
          <h1 key="welcome-header" id="welcome">{`Welcome back, ${this.state.currentUser.displayName}!`}</h1></div>];
      }
    } else {
      content = (
        <div>
          <h1> Loading...</h1>
          <h2> Remember to turn off your pop-up blocker </h2>
          <h2>{'Reload the page if nothing\'s happening'}</h2>
        </div>
      );
    }

    return content;
  }


  prepareSignIn(e) {
    if (!this.state.currentUser) {
      firebasedb.facebookAuthorize(this.onAuthStateChanged);
      this.setState({ loadedUser: false });
    }
  }
  render() {
    return (
      <div id="home-main">
        <div id="sign-in" onClick={this.prepareSignIn}>
          {this.getSignInPrompt()}
        </div>
      </div>
    );
  }
}

export default Welcome;
