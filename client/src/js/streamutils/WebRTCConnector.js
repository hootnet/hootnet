// import labeledStream from './labeledStream';
import Blobber from './Blobber';
import Restreamer from './Restreamer';
const BLOB_CHANNEL = 'BlobChannel';
const TEXT_CHANNEL = 'TextChannel';
class WebRTCConnector {
  static getTextChannelName() {
    return TEXT_CHANNEL;
  }
  static getBlobChannelName() {
    return BLOB_CHANNEL;
  }
  constructor(peer, name) {
    this.name = name;
    this.peer = peer;
    this.channels = {};
    this.peer = peer;
    this.textHandler = this.createDataChannel(TEXT_CHANNEL, 'text');
    this.textHandler.onOpenChannel = () => {
      if (this.onOpenTextChannel) this.onOpenTextChannel();
    };
    this.binaryHandler = this.createDataChannel(BLOB_CHANNEL, 'binary');
    this.binaryHandler.onOpenChannel = () => {
      if (this.onOpenBinaryChannel) this.onOpenBinaryChannel();
    };
    this.blobChannel = this.channels[BLOB_CHANNEL].channel;
    this.textChannel = this.channels[TEXT_CHANNEL].channel;
    // this.sendText = this.sendText.bind(this);

    this.peer.addEventListener('datachannel', this.awaitDataChannel.bind(this));
  }
  getTextChannel() {
    return this.getChannel(WebRTCConnector.getTextChannelName());
  }
  getBinaryChannel() {
    return this.getChannel(WebRTCConnector.getBlobChannelName());
  }
  createDataChannel(name, type) {
    const channel = this.peer.createDataChannel(name);
    const handler = new ChannelHandler(name, channel);
    if (type === 'binary') {
      channel.binaryType = 'arraybuffer';
    }
    this.channels[name] = { channel, handler };

    return handler;
    // const theChannel = this.channels[event.channel.label]
  }
  getChannel(name) {
    return this.channels[name].channel;
  }
  getHandler(name) {
    return this.channels[name].handler;
  }
  setHandler(name, handler) {
    this.channels[name].handler = handler;
  }

  getBlobber(name) {
    return this.channels[name].blobber;
  }
  setBlobber(name, blobber) {
    this.channels[name].blobber = blobber;
  }
  getRestreamer(name) {
    return this.channels[name].restreamer;
  }
  setRestreamer(name, restreamer) {
    this.channels[name].restreamer = restreamer;
  }
  receiveDefaultStream() {
    const controlVideo = document.createElement('video')
    receiveStream(BLOB_CHANNEL,
      { audio: true, video: true },
      controlVideo
    )
    // incomingStream = (<any>incomingControlVideo).captureStream()
    return controlVideo.captureStream()
  }
  receiveStream(name, configuration, sentVideo) {
    const restreamer = new Restreamer(sentVideo, configuration);
    restreamer.start();
    this.setRestreamer(name);
    this.onBlob((blob) => {
      // console.log("Got Blob ", blob.constructor.name, blob.size);
      restreamer.addBlob(blob);
    });
    return restreamer;
  }
  createDefaultStream(stream) {
    this.createStream(BLOB_CHANNEL, stream);
  }
  createStream(channelName, stream) {
    const ch = this.getHandler(channelName);
    const blobber = new Blobber(stream);
    this.setBlobber(channelName, blobber);
    blobber.onBlob((message) => {
      console.log("Blob", message.constructor.name);
      ch.sendBinaryData(message);
    });
    ch.onMessage(() => {
      console.log('Stream Message');
    });
  }
  startDefaultStream() {
    console.log("Start Default stream")
    this.startStream(BLOB_CHANNEL);
  }
  stopDefaultStream() {
    console.log("Stop Default stream")
    this.stopStream(BLOB_CHANNEL);
  }
  startStream(channelName) {
    console.log("Start A stream")
    const blobber = this.getBlobber(channelName);
    blobber.start(60);
  }
  stopStream(channelName) {
    if (this.getBlobber(channelName)) {
      const blobber = this.getBlobber(channelName);
      blobber.stopBlobber();
      this.setBlobber(channelName, null);
    }
    if (this.getRestreamer(channelName)) {
      const restreamer = this.getRestreamer(channelName);
      restreamer.stopRestreamer();
      this.setRestreamer(channelName, null);
    }
  }

  awaitDataChannel(event) {
    console.log(
      this.name,
      'received a data channel notifiction',
      event.channel.label
    );
    const handler = this.getHandler(event.channel.label);
    handler.setDataChannel(event.channel);
    handler.onOpenChannel();
  }

  onBlob(cb) {
    const convertToBlob = (arrayBuffer) => {
      // console.log("Convert to blob called", arrayBuffer.byteLength);
      const blob = new Blob([arrayBuffer]);
      // if (this.restreamer) {
      //   this.restreamer.addBlob(blob);
      // }
      cb(blob);
    };
    this.getHandler(BLOB_CHANNEL).onMessage(convertToBlob);
  }
  sendText(message) {
    this.getHandler(TEXT_CHANNEL).sendText(message);
  }
  onText(cb) {
    console.log('Called onText WITH CB');
    this.getHandler(TEXT_CHANNEL).onMessage(cb);
  }
}
class ChannelHandler {
  constructor(name, channel, dataChannel) {
    // console.log("Set up datachannel", name, channel);
    this.name = name;
    this.channel = channel;
    this.dataChannel = dataChannel;
  }
  setDataChannel(dataChannel) {
    this.dataChannel = dataChannel;
    this.dataChannel.addEventListener('open', this.awaitOpen.bind(this));
    this.dataChannel.addEventListener('close', this.awaitClose.bind(this));
  }
  //eslint-disable-next-line
  awaitClose() { //eslint-disable-line
    // console.log("PC1 Remote close");
    this.sendFunction = null;
  }
  awaitOpen() {//eslint-disable-line
    // console.log(this.name, "Remote open");
    this.channel.addEventListener('message', this.awaitMesage.bind(this));
    this.dataChannel.addEventListener('message', this.awaitDCMesage.bind(this));
    if (this.openCB) this.openCB();
  }
  sendText(message) {
    console.log('Send Text called');
    this.channel.send(message);
  }
  sendBinaryData(message) {
    if (message.constructor.name === 'ArrayBuffer') {
      this.channel.send(message);
    } else {
      message.arrayBuffer().then((buffer) => {
        // console.log("Array Buffer length", buffer.byteLength);
        this.channel.send(buffer);
      });
    }
  }
  respond(message) {
    this.dataChannel.send('response: ' + message);
  }
  awaitMesage(event) {
    console.log('received on channel', this.name, JSON.stringify(event.data));
    console.log(event.data);
  }
  onMessage(cb) {
    this.cb = cb;
  }
  awaitDCMesage(event) {
    // console.log("received DC channel", this.name);
    if (this.cb) this.cb(event.data);
    // this.respond("ack");
  }
}

export default WebRTCConnector;
// export { Sender, Receiver };

/*
const blb    = new Blob(["Lorem ipsum sit"], {type: "text/plain"});
const reader = new FileReader();

// This fires after the blob has been read/loaded.
reader.addEventListener('loadend', (e) => {
  const text = e.srcElement.result;
  console.log(text);
});

// Start reading the blob as text.
reader.readAsText(blb);
*/
