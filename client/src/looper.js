import React from 'react';
import { render } from 'react-dom';
import {loopApp} from './js/loop'
import { Provider } from 'overmind-react';
import LoopApp from './js/LoopApp';

const renderApp = () => render(
    
    <Provider value={loopApp}>
        <LoopApp />
    </Provider>
    
    , document.getElementById('root'));
renderApp()
