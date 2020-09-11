import { json } from "overmind";
import { toast } from "react-toastify";
import labeledStream from "../streamutils/labeledStream";
import PeerConnection from "../PeerConnection";
// import VideoStreamMerger from "../streamutils/video-stream-merger";

const actionOps = {
  onReload({ state, actions }) {
    actions.tests._init()
    actions.setTestWindow('')
    actions.tests._parseCommand()
    actions.cascade()
    // actions.tests._setMessage()
    // actions.tests.clearResults()
    // // actions.tests._sessionOfName()
    // actions.tests._setCascadeOrder()
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
  getRemoteStream({ state, actions }, id) {
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
  sessionsOfList({ state, actions }, list) {
    return list.split(',').map(name => actions.sessionOfName(name))
  },
  sessionOfName({ state }, name) {
    // console.log("TRANSLATE", name)
    name = name.toLowerCase()
    if (state.users[name]) return name //return if session number passed in
    const foundSession = Object.keys(state.users).find(session => state.users[session].name.toLowerCase() === name)
    if (foundSession) return foundSession
    throw new Error("sessionsOfName not defined: " + name)
  },
  doDemo({ state }) {
    state.componentStatus.recorderDemo = "show"
  },

  setCurrentWindow({ state }, window) {
    state.currentWindow = window
  },
  parseCommand({ actions }, command) {
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
    toList.map(to => actions.relayAction({ to, op: 'doAction', data: {action: parse.op, arg: parse.arg} }))
  },
  cascade({ actions }) {
    actions.exec("all: setWarning 'some  more warning'")
    // actions.exec("all: setCascadeOrder noel-jess-neale")
    // actions.exec("mike: makeController")
    // actions.exec("cascaders: connectCascaders")
    // actions.exec("cascaders: connectToController")
    // actions.exec("controller connectToCascaders")
    // actions.exec("noel: startCascade")
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
    actions.joinRoom()
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
    const separators = /[\s:,]+/
    const cascaders = order.split(separators)
      .map(name => actions.sessionOfName(name))
      .filter(item => !item.match(separators))
    state.sessions.cascaders = cascaders
    return cascaders
  },

  // startCascade({ state, actions }, spec) {
  //   console.clear();
  //   if (state.members.length < 2) {
  //     actions.setMessage("Can't start a cascade with only you in the room.");
  //     return;
  //   }
  //   actions.startCascaders();
  //   // actions.startControllers();
  //   // actions.startViewers();
  // },
  // startChat({ state, actions }) {
  //     state.members.forEach(id => {
  //         actions.relayAction({
  //             to: id,
  //             op: "startChat",
  //             data: { from: state.attrs.id }
  //         });
  //     });
  // },
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
      diag("local stream not running when trying to connect")
      setTimeout(connectRoom, 1000)
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
        actions.reconnect()

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


      if (actions.initiatesTo(member)) {
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
  endCall({ state, actions }, { isStarter, from }) {
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
  // relayAction({ state, effects }, { to, op, data }) {
  //     effects.socket.actions.relayEffect(to, op, data)
  // },
  // startCascade({ state, actions, effects }) {
  //     if (state.members.length < 2) {
  //         actions.setMessage("Can't start a cascade with only you in the room.")
  //         return
  //     }
  //     actions.diag('start cascade')
  //     let nextMember
  //     state.sessions.cascaders.slice(0, -1).map((member, sequence) => {
  //         nextMember = state.sessions.cascaders[sequence + 1]
  //         actions.relayAction({
  //             to: member,
  //             op: "startcall",
  //             data: { responder: nextMember }
  //         })
  //     })
  //     state.sessions.controllers.map((member, sequence) => {

  //         actions.relayAction({
  //             to: nextMember,
  //             op: "startcall",
  //             data: { responder: member }
  //         })
  //         nextMember = member
  //     })
  // },
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
    actions.endCall({ from: state.attrs.id })
    state.members.forEach(id => {
      actions.relayAction({
        to: id,
        op: "end",
        data: { from: state.attrs.id }
      });
    });
  },

  deleteUserEntry({ state }, id) {
    actions.clearFaderTimeout(id)
    if (actions.getRemoteStream(id)) {
      actions.deleteRemoteStream(id)
    }
    delete state.users[id]
  },
  fadeUserEntry({ state }, id) {
    const user = state.users[id]
    user.opacity = user.opacity - 0.01
    if (user.opacity <= 0) {
      actions.deleteUserEntry(id)

    }

  },
  setMembers({ state, actions }, data) {
    const newMembers = data.members.filter(member => !state.members.includes(member))
    const droppedMembers = state.members.filter(member => !data.members.includes(member))
    console.log("old", json(state.members), "new ", newMembers, "dropped", droppedMembers)
    state.members = data.members
    newMembers.forEach(member => {
      actions.relayAction({ to: member, op: "getInfo" });
    });
    droppedMembers.forEach(member => {
      const user = json(state.users[member])
      if (user.faderTimeOut) return
      state.users[member].faderTimeOut = setTimeout(() => {
        actions.fadeUserEntry(member)
      }, 100)
    })
    actions.computeCategories();
  },
  computeCategories({ state, actions }) {
    let cascaders = [];
    const controllers = [];
    const viewers = [];
    const members = [];
    const directors = []
    state.members.forEach(key => {
      const user = state.users[key];
      if (!user) return;
      const control = user.control;
      const seq = parseInt(control, 10);
      if (seq) {
        if (!cascaders[seq]) cascaders[seq] = [];
        cascaders[seq].push(key);
      } else if (control) {
        if (control.toLowerCase() === "control") {
          controllers.push(key);
        } else if (control.toLowerCase() === "director") {
          directors.push(key)
        } else if (control.toLowerCase() === "member") {
          members.push(key)
        } else if (control.toLowerCase() === "viewer") {
          viewers.push(key);
        } else {
          console.log("CONTROL iS", control)
          actions.setMessage(
            'Control must be a number, or "control" or "member"'
          );

        }
      }
    });
    cascaders = cascaders.flat().filter(a => a);
    state.allSessions = cascaders.concat(controllers).concat(viewers).concat(members).concat(directors);
    state.sessions = {
      cascaders,
      controllers,
      viewers,
      members,
      directors
    };
    state.index = state.sessions.cascaders.findIndex(e => e === state.attrs.id);
  },
  sendUserInfo({ state, actions }, request) {
    const data = Object.assign(json(state.attrs), request);
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
    if (!state.users[id]) state.users[id] = {};

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
  setupStreams({ state, actions }) {
    // const id = state.attrs.id;
    if (!state.streams.cascadeStream) {
      const merger = labeledStream(
        json(state.streams.localStream),
        state.attrs.name,
        state.index,
        state.sessions.cascaders.length
      );
      actions.addStream({ name: "cascadeMerger", stream: merger });

      actions.addStream({ name: "cascadeStream", stream: merger.result });
    }
  },
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
