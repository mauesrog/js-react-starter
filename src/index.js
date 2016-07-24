import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/app';

import './style.scss';

let historyIndex = 0;
const history = [];

const historyElements = {
  historyIndex,
  history,
};

// entry point that just renders app
// could be used for routing at some point
ReactDOM.render(<App />, document.getElementById('main'));


export default historyElements;
