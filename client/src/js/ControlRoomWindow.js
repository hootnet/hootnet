import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { useApp } from './app'
import { json } from 'overmind';
import labeledStream from './streamutils/labeledStream'
import MoveableVideo from './MoveableVideo'


const getButtonClass = (icon, enabled) => classnames(`btn-action fa ${icon}`, { disable: !enabled });

function ControlRoomWindow({ endCall }) {
  //   const peerVideo = useRef(null);
  // const localVideo = useRef(null);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const { state, actions } = useApp()
  const localVideo = React.useRef(null)
  const [mergers, setMergers] = useState([])
  const videoRefs = state.sessions.cascaders.map(cascader => useRef(null))

  /**
   * Turn on/off a media device
   * @param {String} deviceType - Type of the device eg: Video, Audio
   */
  const toggleMediaDevice = (deviceType) => {
    // if (deviceType === 'video') {
    //     setVideo(!video);
    //     mediaDevice.toggle('Video');
    // }
    // if (deviceType === 'audio') {
    //     setAudio(!audio);
    //     mediaDevice.toggle('Audio');
    // }
  };

  React.useEffect(() => {
    const stream = json(state.streams.cascadeStream)
    if (localVideo && localVideo.current && stream) {
      // console.log('Using The Effect',  stream)
      localVideo.current.srcObject = stream
    }
    if (stream) {
      const newMergers = []
      state.sessions.cascaders.forEach((cascader, index) => {
        const merger = labeledStream(json(stream), "unlabeled",
          index,
          state.sessions.cascaders.length, { extract: true })
        newMergers.push(merger)
        setMergers(newMergers)
      })
    }
  }, [localVideo, state.streams.cascadeStream])
  React.useEffect(() => {
    videoRefs.forEach((videoRef, i) => {
      if (videoRef && videoRef.current) {
        videoRef.current.srcObject = mergers[i].result
      }
    })
  }, [videoRefs])

  return (
    <div className={ classnames('cascade-window') }>
      {/* <video style{{height={ 300 } ref={ localVideo } autoPlay /> */ }
      { mergers.map((merger, i) => {
        return <MoveableVideo key={ i }
          target={ <video height={ 300 } ref={ videoRefs[i] } autoPlay /> }
        />

      }) }
      <div className='video-control'>
        <button
          key='btnVideo'
          type='button'
          className={ getButtonClass('fa-video-camera', video) }
          onClick={ () => toggleMediaDevice('video') }
        />
        <button
          key='btnAudio'
          type='button'
          className={ getButtonClass('fa-microphone', audio) }
          onClick={ () => toggleMediaDevice('audio') }
        />
        <button
          type='button'
          className='btn-action hangup fa fa-phone'
          onClick={ () => {
            actions.endCascade();
          } }
        />
      </div>
    </div>
  );
}


export default ControlRoomWindow;
