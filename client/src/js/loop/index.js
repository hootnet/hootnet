import { createHook } from 'overmind-react';
import { createOvermind } from 'overmind';
import { logLoader } from '../../util/logloader';
import actions from './actions';
import effects from './effects';
import state from './state';

logLoader(module);


let theActions;

const onInitialize = (
  {
    //   state,
    actions,
    effects
  }) => {  
};
const config = {
  state,
  actions,
  effects,
  onInitialize
};
export let loopApp;
export let useApp;

const initialize = () => {
  loopApp = createOvermind(config, {
    devtools: navigator.userAgent.match(/ CrOS /)
      ? 'penguin.linux.test:3031'
      : 'localhost:3031'
  });
  useApp = createHook();
};
if (!module.hot) {
  console.log('not hot');
  initialize();
} else {
  module.hot.dispose((data) => {
    // console.log('disposing of the CB ', cb + '')
    // socket.off('confirm', cb)
    // data.cb = cb
    if (data.cb) console.log('THIS IS JUST TO KEEP THIS ALIVE');
  });
  if (!module.hot.data) {
    console.log('no hot data');
    initialize();
    /** Now we should always have module.hot.data */
  } else {
    console.log('Hot data output');
    // console.log('disposing', data.cb + '', cb + '')
    initialize();
  }
}
