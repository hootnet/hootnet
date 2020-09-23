import React, { useEffect } from 'react';
import { useApp } from './app'
// import App from './Pages/TimingTest'
import App from './HootNetApp'
import socket from './socket'
const Base = () => {
  const { actions, state, effects } = useApp()
  useEffect(() => {
    console.log("Effect is all finally set")
    socket
      .on('init', (attrs) => {
        // this.effects.socket.actions.gotEvent('init')
        actions.setId(attrs.id)
        document.title = `${attrs.id} ${attrs.name} - Session`;
        // this.setState({ clientId }); 
        // socket.emit('debug', `App initted ${clientId}`)

      })

      .emit('init', state.attrs);
    effects.setActionsAndState(actions, state)
    setTimeout(actions.onReload, 100)
  }, [])
  return (
    <App />)
}
export default Base