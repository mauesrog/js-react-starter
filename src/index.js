import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router';
import Routes from './routes.js';

import './style.scss';

function wholeSite() {
  return (
    <Router history={browserHistory}>
      {Routes}
    </Router>
  );
}

ReactDOM.render(wholeSite(), document.getElementById('main'));
