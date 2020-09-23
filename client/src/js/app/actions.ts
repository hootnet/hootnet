import { json, action } from "overmind";
// import { toast } from "react-toastify";
import labeledStream from "../streamutils/labeledStream";
import PeerConnection from "../PeerConnection";
// import VideoStreamMerger from "../streamutils/video-stream-merger";
import { Action } from "overmind";
import { string } from "prop-types";

// type SessionID = string;

// type Window = {
//   actions: { [name: string]: any };
//   state: { [name: string]: any };
//   setState: (path: string, value: any) => void;
//   location: any;
//   open: (url: string, name?: string, specs?: string) => any;
// }
// let myWindow: Window = <any>window
const actionOps = {
  setStreamInProgress({ state }, value) {
    if (value === undefined) {
      state.streamInProgress = !state.streamInProgress
    } else {
      state.streamInProgress = value
    }
  },

  onReload({ state, actions }) {
    console.log("Reloading")
    // if (!state.hasLoaded) {
    //   state.hasLoaded = true
    //   setTimeout(() => actions.onReload(), 10)
    // } else {

    // myWindow.actions = actions
    // myWindow.state = state
    // actions.tests._init()
    // myWindow.setState = (path, value) => {
    //   actions.setState({ path, value })
    // }

    actions.setCascadeOrder("mike-noel-neale")
    actions.setWarning(`Session name is ${state.attrs.name}`)
    actions.setTestWindow('')
    // actions.exec("all: setWarning 'Ready for a test?'")
    // actions.prepareTheCascade()
    // console.log("DONE")
    // actions.exec("all: setController mike")
    // actions.exec("all: prepareTheCascade")
    // actions.exec("neale: startTheCascade")

    // actions.tests._parseCommand()
    // actions.cascade()
    // actions.openWindow({ name: "window10", spec: "left=200,height=200,width=200" })
    // actions.openWindow({ name: "window27", spec: "left=600,height=200,width=200" })

    // actions.tests._setMessage()
    // actions.tests.clearResults()
    // // actions.tests._sessionOfName()
    // actions.tests._setCascadeOrder()
    // }
  },
  setState({ state }, { pathString, value }: { pathString: string, value: string }): void {
    const path: Array<string> = pathString.split(".")
    let element = state
    for (let i = 0; i < path.length - 1; i++) {
      if (element[path[i]] === undefined) element[path[i]] = {}
      element = element[path[i]]
    }
    element[path[path.length - 1]] = value

  },
  allOff({ state }) {
    Object.keys(state.users).map(key => {
      state.users[key].video = "off"
      state.users[key].muted = true
    })
  },
  allOn({ state }) {
    Object.keys(state.users).map(key => {
      state.users[key].video = "on"
      state.users[key].muted = false
    })
  },
  soundOff({ state }, id) {
    if (!id) id = state.attrs.id
    state.users[id].muted = true
  },
  soundOn({ state }, id) {
    if (!id) id = state.attrs.id
    state.users[id].muted = false
  },
  videoOff({ state }, id) {
    if (!id) id = state.attrs.id
    state.users[id].video = "off"
  },
  videoOn({ state }, id) {
    if (!id) id = state.attrs.id
    state.users[id].video = "on"
  },

  setTestWindow({ state }, window) {
    state.testWindow = window
  },
  getStream({ state, actions }, name) {
    if (state.streams[name]) {
      return json(state.streams[name])
    } else {
      actions.diag("stream " + name + " can't be found")
    }

  },
  getRemoteStream({ state }, id) {
    if (state.users[id] && state.users[id].remoteStream) {
      return json(state.users[id].remoteStream)
    } else {
      return null
    }
  },
  setRemoteStream({ state }, { member, stream }) {
    state.users[member].remoteStream = stream
  },
  getConnector({ state }, id) {
    return PeerConnection.PeerConnections[id]
    // return state.users[id].peerConnection.connector
  },
  setPeerConnection({ state }, { id, pc }) {
    state.users[id].peerConnection = pc
  },
  getPeerConnection({ state }, id) {
    return json(state.users[id].peerConnection)
  },
  clearPeerConnection({ state, actions }, id) {
    const pc = actions.getPeerConnection(id)
    if (pc) pc.stop()
    state.users[id].peerConnection = null
  },
  clearRemoteStream({ state, actions }, id) {
    const stream = actions.getRemoteStream(id)
    stream.getTracks().forEach(track => {
      track.stop()
      stream.removeTrack(track)
    })
    state.users[id].remoteStream = null
    actions.clearPeerConnection(id)
  },
  sessionsOfList({ actions }, list) {
    return list.split(',').map(name => actions.sessionOfName(name))
  },
  sessionOfName({ state, actions }, name) {
    if (name) name = name.toLowerCase();
    if (state.users[name]) return name //return if session number passed in
    const foundSession = Object.keys(state.users)
      .find(session => state.users[session].name && state.users[session].name.toLowerCase() === name)
    if (foundSession) return foundSession
    actions.setError(name + " is not in the cascade")
    return null
  },
  doDemo({ actions, state }) {
    if (state.currentWindow === "casade") {
      state.currentWindow = "chat"
      return
    }

    actions.setCascadeOrder("mike-noel")
    actions.prepareTheCascade()

    // actions.exec("noel: prepareTheCascade")


    // state.componentStatus.recorderDemo = "show"
  },

  setCurrentWindow({ state }, window) {
    state.currentWindow = window
  },
  openWindow({ }, { location = <any>window.location, name = "new", spec = "left=200, height=200, width = 200" }) {
    console.log("OPEN WINDOWS", { location, name, spec })
    window.open(location, name, spec)
  },
  parseCommand({ }, command) {
    const matcher = command.match(/^\s*(\w*)\s*:\s*(\w*)\s*(.*)?$/)
    if (matcher[3] === undefined) return { to: matcher[1], op: matcher[2] }
    const quote = matcher[3].match(/"([^"]*)"/)
    if (quote) { matcher[3] = quote[1] } else {
      const quote1 = matcher[3].match(/'([^']*)'/)
      if (quote1) { matcher[3] = quote1[1] }
    }
    return { to: matcher[1], op: matcher[2], arg: matcher[3] }
  },
  processTo({ actions, state }, list) {
    switch (list) {
      case 'all':
        return state.members
      case 'cascaders':
        return state.sessions.cascaders
      case 'controler':
        return state.sessions.controlers
      default:
        return actions.sessionsOfList(list)
    }

  },
  exec({ actions }, command) {
    const parse = actions.parseCommand(command)
    const toList = actions.processTo(parse.to)
    toList.map(to => actions.relayAction({ to, op: 'doAction', data: { action: parse.op, arg: parse.arg } }))
  },

  doAction({ actions }, action) {
    if (typeof action !== 'object') {
      action = { action }
    }
    if (!action.action) {
      action = { action: 'diag', payload: "need an action" }
      return
    }
    actions[action.action](action.arg)
    actions.setMessage(`${action.action}(${action.arg})`)
  },
  editor: {
    set({ state }, text) {
      state.directorText = text;
    }
  },
  // newConnnectionID({ state }) {
  //   state.peerData.connectionSequence++;
  //   return state.attrs.id + '-c-' + state.peerData.connectionSequence;
  // },
  // createConnection({ state, actions }, { peerID, pc }) {
  //   const connectionID = actions.newConnnectionID;
  //   state.peerData.connections[connectionID] = {
  //     peerID,
  //     pc
  //   };
  // },
  // getConnection({ state }, connectionID) {
  //   const connection = state.peerData.connections[connectionID];
  //   if (!connection) throw new Error(`missing connection ${connectionID}`);
  //   return connection;
  // },
  // getPeerID({ actions }, connectionID) {
  //   return actions.getConnection(connectionID).peerID;
  // },
  // getPeerConnection({ actions }, connectionID) {
  //   return json(actions.getConnection(connectionID).pc);
  // },
  // deleteConnection({ state, actions }, connectionID) {
  //   if (state.peerData.connections[connectionID]) {
  //     actions.relayAction({ op: 'deleteConnection', to: actions.getPeerID(connectionID), connectionID })
  //   }
  //   const peer = actions.getPeerConnection(connectionID)
  //   peer.stop()
  //   delete state.peerData.connections[connectionID]
  // },

  setMediaDevices({ state, actions }, mediaDevices) {
    state.mediaDevices = mediaDevices
    if (state.attrs.roomStatus === 'joined') actions.joinRoom()
  },
  getMediaDevices({ state }) {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const extracts = devices.map((device) => {
        const { kind, deviceId, label } = device
        return { kind, deviceId, label }

      })
      state.mediaDevices = extracts
    })
  },
  changeMedia({ state }) {
    state.changeMedia = !state.changeMedia
  },
  setAppState({ state }, { prop, value }) {
    state.AppState[prop] = value;
  },
  relayAction({ effects }, { to, op, data }) {
    effects.socket.actions.relayEffect(to, op, data);
  },
  setCascadeOrder({ state, actions }, order) {
    state.cascadeOrder = order
    const separators = /[\s:\-,]+/
    state.sessions.cascaders = []
    const cascaders = order.split(separators)
      .map(name => actions.sessionOfName(name)).filter(name => name)
    state.sessions.cascaders = cascaders
    return cascaders
  },


  endAllStreams({ state, actions }) {
    state.members.forEach(id => {
      actions.relayAction({
        to: id,
        op: "endChat",
        data: { from: state.attrs.id }
      });
    });
  },
  initiatesTo({ state }, member) {
    if (state.attrs.id < member) {
      // actions.diag(state.attrs.id + " initiates to " + member)
      return true
    } else {
      // actions.diag(state.attrs.id + " does not initiate to " + member)
      return false
    }
  },
  leaveRoom({ state, actions }) {
    state.currentWindow = "main"
    actions.setRoomStatus("left")
    actions.endStreams()
  },
  joinRoom({ state, actions }) {
    actions.setRoomStatus('joined')
    state.currentWindow = 'chat'
    actions.connectRoom()
  },
  connectRoom({ state, actions }) {
    if (!state.streams.localStream) {
      actions.diag("local stream not running when trying to connect")
      setTimeout(actions.connectRoom, 1000)
    }
    let allPresent = true
    state.members.map((member) => {
      if (!state.users[member]) {
        allPresent = false
        actions.relayAction({ to: member, op: "getInfo" });
      }
    })
    //If not all present, try again in a minute
    if (!allPresent) {
      setTimeout(() => {
        actions.diag("not all present for connect room")
        actions.connectRoom()

      }, 1000);
      return
    }
    // console.log("connecting to ", state.members)
    state.members.map((member) => {
      if (!state.users[member]) return
      if (state.users[member].roomStatus !== 'joined') return
      // const newStream = new MediaStream()
      // newStream.streamNumber = state.streamNumber++
      // actions.setRemoteStream({ member, stream: newStream })


      if (!actions.initiatesTo(member)) {
        actions.relayAction({ to: member, op: "info", data: json(state.attrs) });
      } else {
        if (actions.getRemoteStream(member)) return
        if (state.users[member].recentlyConnected) return
        state.users[member].recentlyConnected = true
        setTimeout(() => state.users[member].recentlyConnected = false, 2000)
        actions.relayAction({
          to: member,
          op: "startcall",
          data: { initiator: member, responder: state.attrs.id, role: 'chat' }
        });
      }
    });
  },
  endStreams({ state, actions }) {
    console.log("Ending Streams    ")
    // actions.endCall({ from: state.attrs.id })
    state.peerEvents++
    state.members.forEach(id => {
      actions.relayAction({
        to: id,
        op: "end",
        data: { from: state.attrs.id }
      });
      actions.relayAction({
        to: state.attrs.id,
        op: "end",
        data: { from: id }
      });
    }
    )

  },
  startCascaders({ state, actions }) {
    state.sessions.cascaders.slice(0, -1).map((member, sequence) => {
      state.nextMember = state.sessions.cascaders[sequence + 1];
      actions.relayAction({
        to: member,
        op: "startcall",
        data: { initiator: member, responder: state.nextMember, role: 'cascade' }
      });
    });
  },
  startControllers({ state, actions }) {
    state.sessions.controllers.map((member) => {
      actions.relayAction({
        to: state.nextMember,
        op: "startcall",
        data: { initiator: state.nextMember, responder: member, role: 'control' }
      });
      state.nextMember = member;
    });
  },
  startViewers({ state, actions }) {
    const nControllers = state.sessions.controllers.length;
    state.sessions.viewers.map((member, sequence) => {
      const controller = state.sessions.controllers[sequence % nControllers];
      actions.relayAction({
        to: controller,
        op: "startcall",
        data: { initiator: controller, responder: member, role: 'view' }
      });
    });
  },
  startCall({ state, actions }, { isCaller, friendID, config, data }) {
    if (!state.streams.localStream || !state.users[friendID]) {
      console.log("Retrying with ", { friendID }, state.streams.localStream, json(state.users[friendID]))
      const retryCall = () => {
        actions.startCall({ isCaller, friendID, config, data })
      }
      setTimeout(retryCall, 1000)
      return
    }
    // actions.setRoomStatus('connecting')
    // if (!state.isCascading) {
    //     actions.setupStreams();
    //     actions.showCallPage();
    // }
    const pc = new PeerConnection(friendID, state);
    // actions.setPeerConnection({id: friendID, pc})
    actions.setPeerConnection({ id: friendID, pc })
    // state.users[friendID].peerConnection = pc
    // state.callInfo[friendID] = {
    //   pc,
    //   config,
    //   isCaller,
    //   data,
    //   status: 'connecting'
    // };
    pc
      .on('localStream', () => {
      })
      .on('peerTrackEvent', (e) => {
        // const src = e.streams[0]
        // actions.setRoomStatus('connected')
        actions.peerTrackEvent({ friendID, event: e })
      })
      .startPeer(isCaller, config, state);
    pc.pc.oniceconnectionstatechange = () => {
      const message = `Ice connection state change for ${friendID} ${pc.pc.iceConnectionState}`
      actions.diag(message)

    }
    pc.pc.onconnectionstatechange = () => {
      const message = `Connection state change for ${friendID} ${pc.pc.connectionState}`
      actions.diag(message)
      // actions.setConnectionStatus({ id: friendID, status: pc.pc.connectionState })

    }
    return pc;
  },
  setConnectionStatus({ state }, { id, status }) {
    state.users[id].connectionStatus = status

  },
  // showCallPage({ state }) {
  //     if (state.index !== -1) {
  //         //part of cascade
  //         state.currentWindow = "cascade";
  //     } else if (state.attrs.control && (
  //         parseInt(state.attrs.control, 10) ||
  //         state.attrs.control.toLowerCase() === "control" ||
  //         state.attrs.control.toLowerCase() === "viewer"
  //     )
  //     ) {
  //         state.currentWindow = "control";
  //     }
  // },

  // setupStreams({ st`ate, actions }, opts) {
  //   const id = state.attrs.id;
  //   actions.createCasdadeStream();
  // },
  isControllerRegistered({ state }) {
    return state.sessions.controllers.length > 0
  },
  stutdownTheCascade({ state, actions }) {
    if (state.sessions.controllers[0]) {
      const toControllerConnector = actions.getConnector(state.sessions.controllers[0])
      //shut down the default stream
    }
    const index = state.sessions.cascaders.indexOf(state.attrs.id)
    if (index > 0) {
      const otherSession = state.sessions.cascaders[index - 1]
      const incomingConnector = actions.getConnector(otherSession)
      const incomingControlVideo = incomingConnector.getControlVideo()
      incomingControlVideo.removeEventListener("canplay")
      incomingControlVideo.removeEventListener("stopped")
    }
    if (index < length - 1) {
      const otherSession = state.sessions.cascaders[index + 1]
      const outboundConnector = actions.getConnector(otherSession)
    }
  },
  getControllerConnector({ state, actions }) {
    if (state.sessions.controllers[0]) {
      return actions.getConnector(state.sessions.controllers[0])
    }
    return null
  },

  getOutboundConnector({ state, actions }) {
    const index = state.sessions.cascaders.indexOf(state.attrs.id)
    const length = state.sessions.cascaders.length
    if (index < length - 1) {
      const otherSession = state.sessions.cascaders[index + 1]
      return actions.getConnector(otherSession)
    }
    return null
  },
  getInboundConnector({ state, actions }) {
    const index = state.sessions.cascaders.indexOf(state.attrs.id)
    if (index > 0) {
      const otherSession = state.sessions.cascaders[index - 1]
      return actions.getConnector(otherSession)
    }
    return null
  },

  prepareTheCascade({ state, actions }) {
    //Bail out if this is not part of the cascade
    // debugger
    if (!state.cascadeOrder) {
      const keys = Object.keys(state.users)
      state.cascadeOrder = (keys.join('-'))
    }
    actions.setStreamInProgress(false)
    actions.setCascadeOrder(state.cascadeOrder)
    if (state.sessions.cascaders.length < 2) {
      actions.setError(`Order: ${state.cascadeOrder}`)
    } else {
      actions.setMessage(`Order: ${state.cascadeOrder}`)
    }
    if (!actions.isCascader()) return
    const localStream = json(state.streams.localStream)

    //set up stream to control
    if (actions.isControllerRegistered()) {
      actions.getControllerConnector()
        .createDefaultStream(localStream);

    }
    //set up cascading streams

    let incomingStream, outboundStream = null
    const BLOB_CHANNEL = 'BlobChannel';

    let incomingControlVideo
    if (!actions.isFirstCascader()) {
      incomingControlVideo = document.createElement('video')
      const inboundConnector = actions.getInboundConnector()
      inboundConnector.receiveStream(
        BLOB_CHANNEL,
        { audio: true, video: true },
        incomingControlVideo
      );

      interface SpecialMediaElement {

        captureStream(frameRate?: number): MediaStream;
      }
      inboundConnector.sendText(
        `Setting up inbound connection between ${state.attrs.id} and ${actions.getPreviousCascader()}`
      );
      // ts-ignore:
      incomingStream = (<any>incomingControlVideo).captureStream()
      state.streams.peerStream = incomingStream
    }
    if (!actions.isLastCascader()) {

      const outboundConnector = actions.getOutboundConnector()
      const merger = labeledStream(localStream, state.attrs.name, actions.getCascaderIndex(), length);
      outboundStream = merger.result
      state.streams.cascadeMerger = merger;
      state.streams.cascadeStream = merger.result;

      outboundConnector.createDefaultStream(outboundStream);
      // PeerConnection.PeerConnections[otherSession].sendText(
      //   `Setting up outbound connection between ${state.attrs.id} and ${otherSession}`

      // )
      // outboundConnector.sendText(
      //   `Setting up outbound connection between ${state.attrs.id} and ${otherSession}`
      // );

      if (!actions.isFirstCascader()) {
        //ended, stalled
        incomingControlVideo.addEventListener("canplay", () => {
          // actions.incomingCanPlay()
          outboundConnector.startDefaultStream();
          outboundConnector.sendText("starting the cascade")
          if (actions.isControllerRegistered()) {
            actions.getContrllerConnector.startDefaultStream()
          }
          merger.addStream(incomingStream, {
            index: -1,
            x: 0, // position of the topleft corner
            y: 0,
            width: merger.width,
            height: merger.height
          });
          "pause.stalled,ended,suspend,waiting,canplay".split(',').forEach(event => {
            incomingControlVideo.addEventListener(event, () => {
              console.log("incoming", event)
            })
          })

          incomingControlVideo.addEventListener("stalled", () => {
            console.log("Stream ended")
            const outboundConnector = actions.getOutboundConnector()
            outboundConnector().stopDefaultStream();
            outboundConnector.sendText("stupping the cascade")
            if (actions.isControllerRegistered()) {
              actions.getControllerConnector().stopDefaultStream()
            }
          })
        });
      }
    }
    state.currentWindow = "cascade";
  },
  getCascaderIndex({ state }) {
    return state.sessions.cascaders.indexOf(state.attrs.id)
  },
  getPreviousCascader({ state }) {
    const index = state.sessions.cascaders.indexOf(state.attrs.id)

    return state.sessions.cascaders[index - 1]
  },
  getNextCascader({ state }) {
    const index = state.sessions.cascaders.indexOf(state.attrs.id)
    return state.sessions.cascaders[index + 1]
  },
  isCascader({ state }) {
    return state.sessions.cascaders.includes(state.attrs.id)
  },
  isFirstCascader({ state }) {
    return state.attrs.id === state.sessions.cascaders[0]
  },
  lastCascader({ state }) {
    return state.sessions.cascaders[state.sessions.cascaders.length - 1]
  },
  isLastCascader({ state, actions }) {
    return state.attrs.id === state.sessions.cascaders[state.sessions.cascaders.length - 1]
  },
  isController({ state }) {
    return state.sessions.controllers.includes(state.attrs.id)
  },
  startTheCascade({ state, actions }) {
    if (state.sessions.controllers[0]) {
      const toControllerConnector = actions.getConnector(state.sessions.controllers[0])
      toControllerConnector.startDefaultStream()
    }
    if (state.attrs.id === state.sessions.cascaders[0]) {
      console.log("starting it up")
      const outboundConnector = actions.getConnector(state.sessions.cascaders[1])
      outboundConnector.startDefaultStream();
      outboundConnector.sendText("starting the cascade")
    }
  },
  stopTheCascade({ state, actions }) {
    if (actions.isControllerRegistered()) {
      actions.getControllerConnector()
        .stopDefaultStream()
    }
    if (!actions.isLastCascader()) {
      actions.getOutboundConnector()
        .stopDefaultStream()
    }
    actions.setCurrentWindow('chat')
  },
  setController({ state, actions }, name) {
    if (name !== state.attrs.name) {
      if (state.attrs.control === "control") {
        state.attrs.control = "member"
        actions.broadcastUserInfo()
      }
    } else {
      state.attrs.control = "control"
      actions.broadcastUserInfo()
      actions.computeCategories()
      actions.setupStreamsInControl()
    }
  },
  setupStreamsInControl({ actions, state }) {
    state.sessions.cascaders.forEach(cascader => {
      const destConnector = actions.getConnector(cascader)
      const BLOB_CHANNEL = 'BlobChannel';

      destConnector.receiveStream(
        BLOB_CHANNEL,
        { audio: true, video: true },
        state.controllerPage.videos[cascader]
      );
    })
  },
  createCascadeStream({ state }) {
    if (!state.streams.cascadeStream) {
      const merger = labeledStream(
        json(state.streams.localStream),
        state.attrs.name,
        state.index,
        state.sessions.cascaders.length
      );
      state.streams.cascadeMerger = merger;
      state.streams.cascadeStream = merger.result;
    }
  },
  endCall({ actions }, { from }) {
    // actions.clearCascade();
    // actions.setRoomStatus('disconnected')
    // if (from === state.attrs.id) return
    actions.setConnectionStatus({ id: from, status: 'disconnected' })
    if (actions.getRemoteStream(from)) {
      actions.clearRemoteStream(from)
    }


    // if (state.callInfo[from] && !state.callInfo[from].stopped) {
    //   const callInfo = json(state.callInfo[from]);
    //   callInfo.pc.stop(isStarter.from);
    //   state.callInfo[from] = {
    //     pc: null,
    //     stopped: true,
    //     status: 'disconnected'
    //   };
    // }

  },
  peerTrackEvent({ state, actions }, { friendID, event: e }) {
    state.peerEvents = state.peerEvents + 1
    const src = e.streams[0];
    actions.setRemoteStream({ member: friendID, stream: src })
    // const stream = actions.getRemoteStream(friendID)
    actions.setConnectionStatus({ id: friendID, status: 'connected' })
    // const tracks = src.getTracks()
    // tracks.forEach(track => {
    //   console.log("adding a track", track.kind)
    //   src.addTrack(track, src)
    // })

  },

  clearCascade({ state }) {
    console.log("clear cascade")
    state.currentWindow = "chat";
    delete state.streams.cascadeStream;
    if (state.streams.cascadeMerger) {
      json(state.streams.cascadeMerger).destroy();
      delete state.streams.cascadeMerger;
    }
  },
  broadcastToRoom({ state, effects }, { message, data }) {
    state.members.forEach(id => {
      effects.socket.actions.relay(id, message, data);
    });
  },

  endCascade({ state, actions }) {
    actions.setMessage(`Ending cascade for room '${state.attrs.room}'.`);
    actions.setCurrentWindow('chat')
    actions.endCall({ from: state.attrs.id })
    state.members.forEach(id => {
      actions.relayAction({
        to: id,
        op: "end",
        data: { from: state.attrs.id }
      });
    });
  },

  deleteUserEntry({ state, actions }, id) {
    actions.clearFaderTimeout(id)
    if (actions.getRemoteStream(id)) {
      actions.deleteRemoteStream(id)
    }
    delete state.users[id]
  },
  fadeUserEntry({ state, actions }, id) {
    const user = state.users[id]
    user.opacity = user.opacity - 0.01
    if (user.opacity <= 0) {
      actions.deleteUserEntry(id)

    }

  },
  setMembers({ state, actions }, data) {
    const newMembers = data.members.filter(member => !state.members.includes(member))
    const droppedMembers = state.members.filter(member => !data.members.includes(member))
    // console.log("old", json(state.members), "new ", newMembers, "dropped", droppedMembers)
    state.members = data.members
    newMembers.forEach(member => {
      actions.relayAction({ to: member, op: "getInfo" });
    });
    droppedMembers.forEach(member => {
      const user = json(state.users[member])
      if (!user) return
      if (user.faderTimeOut) return
      state.users[member].faderTimeOut = setTimeout(() => {
        actions.fadeUserEntry(member)
      }, 100)
    })
    actions.computeCategories();
  },
  toggleRecorder({ state }) {
    if (state.componentStatus.recorderDemo === "show") {
      state.componentStatus.recorderDemo = "hide"
    } else {
      state.componentStatus.recorderDemo = "show"
    }
  },
  computeCategories({ state }) {
    const cascaders = state.sessions.cascaders ? state.sessions.cascaders : []
    const controllers = [];
    const viewers = [];
    const members = [];
    const directors = []
    state.members.forEach(key => {
      const user = state.users[key];
      if (!user) return;
      const control = user.control;
      if (control) {
        if (control.toLowerCase() === "control") {
          controllers.push(key);
        } else if (control.toLowerCase() === "director") {
          directors.push(key)
        } else if (control.toLowerCase() === "member") {
          if (!cascaders.includes(key)) members.push(key)
        } else if (control.toLowerCase() === "viewer") {
          viewers.push(key);
        }

      }
    });
    const allSessions = cascaders.concat(controllers).concat(viewers).concat(members).concat(directors);
    state.sessions = {
      cascaders,
      controllers,
      viewers,
      members,
      directors,
      allSessions
    };
    // state.index = state.sessions.cascaders.findIndex(e => e === state.attrs.id);
  },
  sendUserInfo({ state, actions }, request) {
    const data = Object.assign(json(state.attrs));
    actions.relayAction({ to: request.from, op: "info", data });
  },
  broadcastUserInfo({ state, actions }) {
    state.members.map(member => {
      actions.relayAction({ to: member, op: "info", data: json(state.attrs) });
    })
  },
  toggleReady({ state, actions }) {
    if (state.users[state.attrs.id].status !== 'ready') {
      actions.setRoomStatus('ready')
    } else {
      actions.setRoomStatus('wait!')
    }
    actions.broadcastUserInfo()
  },
  clearFaderTimeout({ state }, id) {
    if (state.users[id].faderTimeOut) {
      clearTimeout(state.users[id].faderTimeOut)
      state.users[id].faderTimeOut = null
    }
  },
  setUserInfo({ state, actions }, data) {
    const id = data.id;
    delete data.id;
    // console.log("got user info for ", id)
    if (!state.users[id]) {
      actions._resources.created("user")
      state.users[id] = {}
    };

    for (const key in data) {
      state.users[id][key] = data[key];
    }
    state.users[id].opacity = 1
    actions.computeCategories();
    actions.clearFaderTimeout(id)
    if (state.attrs.roomStatus === 'joined') actions.connectRoom()

  },
  setMessage({ state, actions }, value = "default message") {
    state._message.text = value;
    setTimeout(actions.clearMessage, state._message.delay);
  },
  setWarning({ state, actions }, value = "default warning") {
    state._message.level = "warning"
    actions.setMessage(value)
  },
  setError({ state, actions }, value = "default error") {
    state._message.level = "error"
    actions.setMessage(value)
  },
  clearMessage({ state }) {
    state._message.text = "";
    state._message.level = ""
  },

  diag({ state }, diag) {
    console.log(diag);
    state.diags.push(diag);
  },


  addStream({ state }, { name, stream }) {
    state.streams[name] = stream;
  },
  addControllerPeer({ state }, src) {
    console.log("Just to avoid an error", state, src)
  },//eslint-disable-line
  addPeerToCascade({ state }, src) {
    const id = state.attrs.id;
    // const control = state.users[id].control;

    state.streams.peerStream = src;

    if (state.sessions.cascaders[0] !== id) {
      const merger = json(state.streams.cascadeMerger);
      merger.addStream(src, {
        index: -1,
        x: 0, // position of the topleft corner
        y: 0,
        width: merger.width,
        height: merger.height
      });
    }
  },
  // setupStreams({ state, actions }) {
  //   // const id = state.attrs.id;
  //   if (!state.streams.cascadeStream) {
  //     const merger = labeledStream(
  //       json(state.streams.localStream),
  //       state.attrs.name,
  //       state.index,
  //       state.sessions.cascaders.length
  //     );
  //     actions.addStream({ name: "cascadeMerger", stream: merger });

  //     actions.addStream({ name: "cascadeStream", stream: merger.result });
  //   }
  // },
  logEvent({ state }, { evType, message, zargs }) {
    const lastEvent = { evType, message, zargs };
    if (message === "ping" || message === "pong") state.lastEvent = lastEvent;
    // state.events.push(lastEvent)
  },
  clearEvents({ state }) {
    state.events = [];
  },
  setRoomStatus({ state, actions }, status) {
    state.attrs.roomStatus = status;
    actions.broadcastUserInfo()
  },

  setAttrs({ state, effects }, attrs) {
    if (!attrs)
      attrs = {
        name: "undefined",
        room: "main",
        role: "undefined",
        control: "undefined",
        id: null
      };
    state.attrs = attrs;
    effects.storage.setAttrs(json(state.attrs));
  },

  setId({ state, effects }, id) {
    state.attrs.id = id;
    effects.storage.setAttrs(json(state.attrs));
  },
  setControl({ state, effects }, control) {
    state.attrs.control = control;
    effects.storage.setAttrs(json(state.attrs));
  },
  register({ state, actions, effects }, data) {
    state.peerEvents++

    let error = false;
    if (data.controlValue !== "undefined") {
      state.attrs.control = data.controlValue;
    } else {
      actions.setMessage("Missing control value");
      error = true;
    }
    if (data.userID !== "undefined") {
      state.attrs.name = data.userID;
    } else {
      actions.setMessage("Missing user name");
      error = true;
    }
    if (data.roomID !== "undefined") {
      state.attrs.room = data.roomID;
    } else {
      actions.setMessage("Missing room name");
      error = true;
    }
    // console.log('registering ', json(state.attrs))
    effects.storage.setAttrs(json(state.attrs));
    if (!error) {
      actions.setRoomStatus('registered')
      if (state.attrs.control === 'director') {
        actions.setCurrentWindow("director")
      }
      actions.broadcastUserInfo()
      effects.socket.actions.register(json(state.attrs));
      actions.joinRoom()
    }
  }
};
export default actionOps;
