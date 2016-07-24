import React from 'react';
import ReactDOM from 'react-dom';

import './style.scss';

// entry point that just renders app
// could be used for routing at some point
ReactDOM.render(<App />, document.getElementById('main'));


export default historyElements;
import { Router, browserHistory } from 'react-router';
import routes from './routes';


// entry point that just renders app
// could be used for routing at some point
ReactDOM.render(
  <Router history={browserHistory} routes={routes} />
  , document.getElementById('main'));
