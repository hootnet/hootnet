import MediaDevice from './MediaDevice';
import Emitter from './Emitter';
import socket from './socket';
import { json } from 'overmind';
import WebRTCConnector from './streamutils/WebRTCConnector';
window.PeerConnections = {}
// @ts-ignore app is declared and not used
import { app } from './app';
const PC_CONFIG = { iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] };
console.log("Module is reloaded")
class PeerConnection extends Emitter {
  static PeerConnections = {}
  /**
   * Create a PeerConnection.
   * @param {String} friendID - ID of the friend you want to call.
   */
  static instance = 0;
  constructor(friendID, state) {
    super();
    PeerConnection.instance++;
    // debug(`PeerConnection from ${friendID} to ${opts.id}`)
    this.pc = new RTCPeerConnection(PC_CONFIG);
    this.connector = new WebRTCConnector(this.pc, state.attrs.id);

    PeerConnection.PeerConnections[friendID] = this.connector
    this.connector.onOpenTextChannel = (c) => {
      console.log('Text channel open');
      this.connector.sendText(
        `Sending greetings from ${state.attrs.id} to ${friendID}`
      );
      this.connector.onText((data) => {
        console.log(`got a message from ${friendID}
      it reads '${data} '`);
      });
    };

    this.tracks = 0;
    this.pc.onicecandidate = (event) =>
      socket.emit('call', {
        to: this.friendID,
        candidate: event.candidate
      });
    this.pc.ontrack = (event) => {
      event.trackNo = this.tracks++;
      // if (state.isChatting || !this.isCaller)
      this.emit('peerTrackEvent', event);
    };

    this.mediaDevice = new MediaDevice();
    // proxyMethods(`pc-${PeerConnection.instance}`, this)
    // proxyMethods(`media-${PeerConnection.instance}`, this.mediaDevice)

    this.friendID = friendID;
  }

  /**
   * Starting the call
   * @param {Boolean} isCaller
   * @param {Object} config - configuration for the call {audio: boolean, video: boolean}
   */
  startPeer(isCaller, config, state) {
    console.log('start peer');
    this.isCaller = isCaller;

    const stream = json(state.streams.localStream);

    if (!stream) {
      stream = json(state.streams.emptyStream);
      console.log('Stream is', stream, state.streams);
    }
    // if (isCaller) {
    //     stream = json(state.streams.emptyStream)
    //     stream = json(state.streams.cascadeStream)

    // }
    // else {
    //     stream = json(state.streams.cascadeStream)
    // }
    stream.getTracks().forEach((track) => {
      this.pc.addTrack(track, stream);
    });
    this.emit('localStream', stream);
    if (isCaller && !this.emitjoin) {
      this.emitjoin = true;
      socket.emit('joincall', {
        initiator: state.attrs.id,
        responder: this.friendID,
        to: this.friendID
      });
    } else this.createOffer();
    return this;
  }

  /**
   * Stop the call
   * @param {Boolean} isStarter
   */
  stop() {
    if (!this.pc) return this;
    if (this.isCaller) {
      socket.emit('end', { to: this.friendID });
    }
    // this.mediaDevice.stop();
    this.pc.close();
    this.pc = null;
    this.off();
    return this;
  }

  createOffer() {
    this.pc
      .createOffer()
      .then(this.getDescription.bind(this))
      .catch((err) => console.log(err));
    return this;
  }

  createAnswer() {
    this.pc
      .createAnswer()
      .then(this.getDescription.bind(this))
      .catch((err) => console.log(err));
    return this;
  }

  getDescription(desc) {
    this.pc.setLocalDescription(desc);
    socket.emit('call', { to: this.friendID, sdp: desc });
    return this;
  }

  /**
   * @param {Object} sdp - Session description
   */
  setRemoteDescription(sdp) {
    const rtcSdp = new RTCSessionDescription(sdp);
    this.pc.setRemoteDescription(rtcSdp);
    return this;
  }

  /**
   * @param {Object} candidate - ICE Candidate
   */
  addIceCandidate(candidate) {
    if (candidate) {
      const iceCandidate = new RTCIceCandidate(candidate);
      this.pc.addIceCandidate(iceCandidate);
    }
    return this;
  }
}
console.log("PEER CONNECTIONS Diag", PeerConnection.PeerConnections)
export default PeerConnection;
if (!module.hot) {
  console.log('Peer Connection not hot');
} else {
  module.hot.dispose((data) => {
    data.saveConnections = PeerConnection.PeerConnections
    console.log("saving ", data.saveConnections)
  });
  if (module.hot.data) {
    console.log("restoring stuff ", module.hot.data.saveConnections)
    PeerConnection.PeerConnections = module.hot.data.saveConnections
  }
}
