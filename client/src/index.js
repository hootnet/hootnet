import React from 'react';
import { render } from 'react-dom';
import { app } from './js/app'
import Base from './js/Base';
import './css/app.scss';
import './css/tailwind.css';
import { Provider } from 'overmind-react';

import 'react-toastify/dist/ReactToastify.css';

const renderApp = () => render(
  <Provider value={ app }>
    <Base />
  </Provider>


  , document.getElementById('root'));
renderApp()
if (module.hot) {
  module.hot.accept(['./js/app', './js/Base'], () => {
    renderApp();
  });

}