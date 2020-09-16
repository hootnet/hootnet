import React, { useEffect, Component } from 'react';
import _ from 'lodash';
import socket from './socket';

import MediaDevice from './MediaDevice';
import EmptyStream from './streamutils/EmptyStream';
import HeaderWindow from './HeaderWindow'
import { useApp, proxyMethods } from './app'
import WindowConfig from './WindowConfig'
// import { getActionPaths } from 'overmind/lib/utils';
class App extends Component {
  constructor(props) {
    super();
    this.oState = props.overmind.state
    this.actions = props.overmind.actions
    this.effects = props.overmind.effects
    this.state = {
      room: this.oState.attrs.room,
      clientId: this.oState.attrs.id || '',
      callWindow: '',
      callFrom: '',
      localSrc: null,
      // nPCs:0
    };

    this.pcs = {}; //array of peer connections
    this.config = null;
    this.startCallHandler = this.startCall.bind(this);
    this.endCallHandler = this.endCall.bind(this);
    this.rejectCallHandler = this.rejectCall.bind(this);

  }

  componentDidMount() {
    'init,startcall,joincall,call,end'.split(',').forEach(key => socket.off(key))
    const cl = (...args) => {
      console.log(...args)
      socket.emit('debug')

    }

    // proxyMethods('socket', socket)
    socket
      .on('init', (attrs) => {
        // this.effects.socket.actions.gotEvent('init')
        const clientId = attrs.id
        this.actions.setId(attrs.id)
        document.title = `${clientId} - VideoCall`;
        this.setState({ clientId });
        // socket.emit('debug', `App initted ${clientId}`)

      })
      .on('startcall', (data) => {
        // socket.emit('debug', 'startcall received')
        // console.log('join received', data)
        this.startCallHandler(true, data.responder, { video: true, audio: true }, data)
      })
      .on('joincall', (data) => {

        console.log("joincall", data)
        const opts = { id: this.state.clientId + 'R' }
        this.startCallHandler(false, data.initiator, { video: true, audio: true }, data)
      })
      .on('call', (data) => {
        const pc = this.pcs[data.from]
        if (data.sdp) {
          pc.setRemoteDescription(data.sdp);
          if (data.sdp.type === 'offer') pc.createAnswer();
        } else pc.addIceCandidate(data.candidate);
      })
      .on('end', (data) => this.endCall.bind(this, false)(data.from))
      .emit('init', this.oState.attrs);
  }

  startCall(isCaller, friendID, config, data) {
    this.config = config;
    const pc = this.actions.startCall({ isCaller, friendID, config, data });
    this.pcs[friendID] = pc
  }

  rejectCall() {
    const { callFrom } = this.state;
    socket.emit('end', { to: callFrom });
  }

  endCall(isStarter, from) {
    this.actions.endCall({ isStarter, from })

  }

  render() {
    const { clientId, callFrom, callWindow, localSrc } = this.state;
    const pc = this.pcs[Object.keys(this.pcs)[0]]

    return (
      <div>
        {/* <ToastContainer /> */ }
        <WindowConfig startCallHandler={ this.startCallHandler } />
      </div>
    );
  }
}
let seq = 1
const mediaDevice = new MediaDevice()
mediaDevice.name = 'Name ' + seq++
const emptyStream = new EmptyStream()
emptyStream.setTitle('Mike')
const WrapApp = () => {
  const { state, actions, effects } = useApp()

  return <div id="wrap" className={ state.colors[state.attrs.name] }>


    <HeaderWindow />
    <App overmind={ { state, actions, effects, currentWindow: state.currentWindow } } />
  </div>

}


export default WrapApp;
