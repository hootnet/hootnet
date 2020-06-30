import MediaDevice from './MediaDevice';
import Emitter from './Emitter';
import socket from './socket';
import labeledStream from "./streamutils/labeledStream"
import {proxyMethods } from "./app"
console.log("Peer loaded")
const debug = (message) => {
    console.log(message)
    socket.emit('debug', message)
}
const PC_CONFIG = { iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] };

class PeerConnection extends Emitter {
    /**
       * Create a PeerConnection.
       * @param {String} friendID - ID of the friend you want to call.
       */
    static merger = null
    static instance = 0
    constructor(friendID, opts) {
        super();
        PeerConnection.instance++
        debug(`PeerConnection from ${friendID} id${opts.id}`)
        this.pc = new RTCPeerConnection(PC_CONFIG);
        this.tracks = 0
        if(PeerConnection.merger && PeerConnection.merger.result != null){
            this.merger = PeerConnection.merger
        }
        this.opts = opts
        this.pc.onicecandidate = (event) => socket.emit('call', {
            to: this.friendID,
            candidate: event.candidate
        });
        this.pc.ontrack = (event) => {
            console.log("On track")
            event.trackNo = this.tracks++
            this.emit('peerTrackEvent', event);
        }
        
        this.mediaDevice = new MediaDevice();
        proxyMethods(`pc-${PeerConnection.instance}`,this)
        proxyMethods(`media-${PeerConnection.instance}`,this.mediaDevice)
        
        
        this.friendID = friendID;
    }

    /**
     * Starting the call
     * @param {Boolean} isCaller
     * @param {Object} config - configuration for the call {audio: boolean, video: boolean}
     */
    start(isCaller, config, pcs) {
        this.mediaDevice
            .on('stream', (stream) => {
                if(!this.merger) {
                    PeerConnection.merger = this.merger = labeledStream(stream, this.opts.id)
                }
                socket.emit('debug', `ID = ${this.opts.id} opts = ${JSON.stringify(this.opts)}`)
                const keys = Object.keys(pcs)
                if (keys.length > 1) {
                    console.log("combining streams")
                    socket.emit('debug', "combining streams")
                    const peerSrc = pcs[keys[0]].peerSrc
                    if (peerSrc) {

                        // peerSrc.getTracks().forEach((track) => {
                        //     socket.emit('debug', `Add track ${track.id}`)
                        //     this.pc.addTrack(track, peerSrc);
                        // })
                        this.merger.addStream(peerSrc, {
                            x: this.merger.width / 2, // position of the topleft corner
                            y: this.merger.height / 2,
                            width: this.merger.width,
                            height: this.merger.height,
                        })

                    }
                    else {
                        this.emit('debug', "no peer src")
                    }
                }
                stream = this.merger.result
                stream.getTracks().forEach((track) => {
                    this.pc.addTrack(track, stream);
                });
                this.emit('localStream', stream);
                if (isCaller) socket.emit('request', { to: this.friendID });
                else this.createOffer();
            })
            .start(config); 

        return this;
    }

    /**
     * Stop the call
     * @param {Boolean} isStarter
     */
    stop(isStarter) {
        if (isStarter) {
            socket.emit('end', { to: this.friendID });
        }
        this.mediaDevice.stop();
        this.pc.close();
        this.pc = null;
        this.off();
        if(this.merger.result) this.merger.destroy()
        return this;
    }

    createOffer() {
        this.pc.createOffer()
            .then(this.getDescription.bind(this))
            .catch((err) => console.log(err));
        return this;
    }

    createAnswer() {
        this.pc.createAnswer()
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

export default PeerConnection;
