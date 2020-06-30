import React, { useEffect, Component } from 'react';
import _ from 'lodash';
import socket from './socket';
import PeerConnection from './PeerConnection';
import MainWindow from './MainWindow';
import CallWindow from './CallWindow';
import CallModal from './CallModal';
// import logloader from "../util/logloader"
import { useApp,proxyMethods } from "./app"
import { ToastContainer } from 'react-toastify'
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
            callModal: '',
            callFrom: '',
            localSrc: null,
            peerSrc: null,
            // nPCs:0
        };

        this.pcs = {}; //array of peer connections
        this.config = null;
        this.startCallHandler = this.startCall.bind(this);
        this.endCallHandler = this.endCall.bind(this);
        this.rejectCallHandler = this.rejectCall.bind(this);

    }

    componentDidMount() {
        console.log("component mounted!!")
        "init,calljoin,request,call,end".split(',').forEach(key => socket.off(key))
        const cl = (...args) => {
            console.log(...args)
            socket.emit('debug')

        }
     
        proxyMethods('socket', socket)
        socket
            .on('init', (attrs) => {
                this.effects.socket.actions.gotEvent('init')
                const clientId = attrs.id
                this.actions.setId(attrs.id)
                document.title = `${clientId} - VideoCall`;
                this.setState({ clientId });
                socket.emit('debug', `App initted ${clientId}`)

            })
            .on('calljoin', (data) => {
                const leader = data.jointo
                socket.emit('debug', 'calljoin received')
                console.log('join received', data)
                data.opts.id = this.state.clientId
                this.startCallHandler(true, leader, { video: true, audio: true }, data.opts)
            })
            .on('request', ({ from: callFrom }) => {
                const opts = { id: this.state.clientId + "R" }
                this.startCallHandler(false, callFrom, { video: true, audio: true }, opts)
                // return
                // this.setState({ callModal: 'active', callFrom });
            })
            .on('call', (data) => {
                console.log("Call from ", data.from)
                const pc = this.pcs[data.from]
                if (data.sdp) {
                    pc.setRemoteDescription(data.sdp);
                    if (data.sdp.type === 'offer') pc.createAnswer();
                } else pc.addIceCandidate(data.candidate);
            })
            .on('end', (data) => this.endCall.bind(this, false)(data.from))
            .emit('init', this.oState.attrs);
    }

    startCall(isCaller, friendID, config, opts = {}) {
        this.config = config;
        const pc = new PeerConnection(friendID, opts)

        this.pcs[friendID] = pc
        // this.setState({nPCs: Object.keys(this.pcs).length})
        pc
            .on('localStream', (src) => {
                const newState = { callWindow: 'active', localSrc: src };
                if (!isCaller) newState.callModal = '';
                this.setState(newState);
            })
            .on('peerTrackEvent', (e) => {
                const src = e.streams[0]
                socket.emit('debug', `${this.state.clientId} has ${e.streams.length} streams`)
                const track = e.track
                console.log("Track", track)
                this.setState({ peerSrc: src })
                pc.peerSrc = src
                if (track > 1) {
                    socket.emit("tracks > 1")
                    const newId = [`X ${friendID}-${Math.floor(track / 2)}`]
                    if (!this.pcs[newId]) {
                        this.pcs[newId] = { peerSrc: new MediaStream(track) }
                    } else {
                        this.pcs[newId].peerSrc.addTrack(track)
                    }
                }
                socket.emit("peerconnect", { trackNo: e.trackNo, room: this.state.room, from: this.state.clientId, friend: friendID, details: { remote: track.remote, label: track.label } })
            })
            .start(isCaller, config, this.pcs);
    }

    rejectCall() {
        const { callFrom } = this.state;
        socket.emit('end', { to: callFrom });
        this.setState({ callModal: '' });
    }

    endCall(isStarter, from) {
        let keys
        if (from) {
            keys = Object.keys(this.pcs).filter(key => (key === from) || key.startsWith("X" + from))
            // keys = [from]
        } else {
            keys = Object.keys(this.pcs)
        }
        keys.forEach(
            (key) => {
                const pc = this.pcs[key]
                if (_.isFunction(pc.stop)) {
                    pc.stop(isStarter, key);
                }
                delete this.pcs[key]
            }
        )
        if (_.isEmpty(this.pcs)) {
            this.config = null;
            this.pcs = {}
            this.setState({
                callWindow: '',
                callModal: '',
                localSrc: null,
                peerSrc: null,
                // nPCs: 0
            })

        } else {
            // this.setState({nPCs: Object.keys(this.pcs).length})

        };
    }

    render() {
        const { clientId, callFrom, callModal, callWindow, localSrc, peerSrc } = this.state;
        const pc = this.pcs[Object.keys(this.pcs)[0]]

        return (
            <div>
                <ToastContainer />

                <MainWindow
                    clientId={clientId}
                    startCall={this.startCallHandler}
                />
                {!_.isEmpty(this.config) && (
                    <CallWindow
                        allpcs={this.pcs}
                        nPCs={Object.keys(this.pcs).length}
                        status={callWindow}
                        localSrc={localSrc}
                        peerSrc={peerSrc}
                        config={this.config}
                        mediaDevice={pc ? pc.mediaDevice : {}}
                        endCall={this.endCallHandler}
                    />
                )}
                <CallModal
                    status={callModal}
                    startCall={this.startCallHandler}
                    rejectCall={this.rejectCallHandler}
                    callFrom={callFrom}
                />
            </div>
        );
    }
}
const WrapApp = () => {
    const { state, actions, effects } = useApp()
    useEffect(() => {
        console.log("Effect applied")
        effects.socket.events.setRegisterAction(actions.register)

    })
    return <div>
        <div>The id is {state.attrs.id} role: {state.attrs.role}</div>
        <App overmind={{ state, actions, effects }} />
    </div>
}

export default WrapApp;
