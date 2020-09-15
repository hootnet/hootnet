import React from 'react';
import classnames from 'classnames';

import { useApp } from './app'
import { json } from 'overmind';
import UserList from './UserList'
// import { positions } from './streamutils/labeledStream'

const getButtonClass = (icon, enabled) => classnames(`btn-action fa ${icon}`, { disable: !enabled });
const getButtonClass1 = (icon, color, disabled) => `fa m-2 text-white bg-${color}-500  h-12 w-12 text-4xl rounded-full ${icon} ${disabled ? "opacity-50" : ''}`
function CascadeWindow() {
  //   const peerVideo = useRef(null);  
  // const peerVideo = useRef(null);
  const [video, setVideo] = React.useState(true);
  const [audio, setAudio] = React.useState(true);
  const { state, actions } = useApp()
  const peerVideo = React.useRef(null)
  const localVideo = React.useRef(null)

  // useEffect(() => {
  //     // if (peerVideo.current && peerSrc) peerVideo.current.srcObject = peerSrc;
  //     if (peerVideo.current && localSrc) peerVideo.current.srcObject = localSrc;
  // });

  // useEffect(() => {
  //     if (mediaDevice) {
  //         mediaDevice.toggle('Video', video);
  //         mediaDevice.toggle('Audio', audio);
  //     }
  // });

  /**
   * Turn on/off a media device
   * @param {String} deviceType - Type of the device eg: Video, Audio
   */
  const toggleMediaDevice = (deviceType) => {
    if (deviceType === 'video') {
      setVideo(!video);
      setVideo(true)
      actions.setWarning("this will  turn off video ")
      // mediaDevice.toggle('Video');
    }
    if (deviceType === 'audio') {
      setAudio(!audio);
      // mediaDevice.toggle('Audio');
    }
  };

  React.useEffect(() => {
    const stream = json(state.streams.peerStream)
    if (peerVideo && peerVideo.current && stream) {
      // console.log('Using The Effect',  stream)
      peerVideo.current.srcObject = stream
    }
  }, [state.streams.peerStream, peerVideo])
  React.useEffect(() => {
    const stream = json(state.streams.localStream)
    if (localVideo && localVideo.current && stream) {
      // console.log('Using The Effect',  stream)
      localVideo.current.srcObject = stream
    }
  }, [state.streams.localStream, localVideo])


  return (
    <div >
      <div className={ "flex flex-col justify-center" }>
        <video className={ "" } ref={ peerVideo } muted={ !audio } autoPlay />
        <video className={ "" } ref={ localVideo } muted autoPlay />
      </div>
      <div className='video-control flex justify-center'>
        <button
          key='btnVideo'
          type='button'
          className={ getButtonClass1('fa-video', 'blue', !video) }
          onClick={ () => toggleMediaDevice('video') }
        />

        <button
          type='button'
          disabled={ state.streamInProgress }
          className={ getButtonClass1('fa-play-circle', 'green', state.streamInProgress) }
          onClick={ () => {
            actions.setStreamInProgress(true)
            actions.setWarning('this will start the cascade stream')
          } }
        />

        <button
          type='button'
          className={ getButtonClass1('fa-stop-circle', 'red', !state.streamInProgress) }
          disabled={ !state.streamInProgress }
          onClick={ () => {
            actions.setStreamInProgress(false)

            // actions.endCascade();
            actions.setWarning('this will end the cascade stream')
          } }
        />

      </div>

    </div>
  );
}


export default CascadeWindow;
