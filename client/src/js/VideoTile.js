import React, { useEffect } from 'react';
import { useApp, proxyMethods } from './app'
import { json } from 'overmind'
import { H3 } from './Typography';


const VideoTile = ({ id }) => {
  const { state, actions, effects } = useApp()
  const [stream, setStream] = React.useState({})
  const ref = React.useRef(null)
  React.useEffect(() => {
    if (ref && ref.current) {
      if (state.attrs.id === id) {
        ref.current.srcObject = json(state.streams.localStream)
      } else {
        ref.current.srcObject = actions.getRemoteStream(id)
      }
    }
  }, [state.users[id].remoteStream, ref, ref.current, state.peerEvents])
  const displayLegend = () => {
    const user = json(state.users[id])
    const legend = ` ${user.name} ${user.roomStatus} (${user.control} ${user.connectionState})`
    return legend

  }
  const displayTile = () => {
    // console.log("Evaluatiing display Tile", { room: state.users[id].roomStatus, connection: state.users[id].connectionStatus })
    if (state.attrs.id !== id) {
      if ((state.attrs.roomStatus !== "joined") || (state.users[id] && state.users[id].roomStatus !== "joined")) {
        return (<H3 >{ state.users[id].name } { state.users[id].roomStatus }</H3>)
      }
    }
    return (
      <video className="flex" ref={ ref }
        autoPlay muted={ id === state.attrs.id } />
    )
  }
  console.log(state.users[id].video === "off" ? " fa-video" : " fa-video-slash")
  return <React.Fragment>
    <div style={ { opacity: state.users[id].opacity } } className="flex-col text-black bg-gray-800  ">
      { displayTile(state.users[id].roomStatus) }
      <div className="flex h-8 bg-gray-200">

        <button
          type='button'
          className={ `mt-1 border-1 border-solid border-gray-700 rounded 
           text-black mr-1 flex-1 btn-action fa `
            + (!(state.users[id].video === "off") ? "bg-green-400 fa-video" : " bg-red-600 fa-video-slash")
          }
        // onClick={ acceptWithVideo(true)
        />
        <button
          type='button'
          className={ `mt-1 bg-gray-200 border-1 border-solid border-gray-700 rounded  
          text-black ml-1 flex-1 btn-action fa `
            + (!state.users[id].muted ? "bg-green-400 fa-microphone" : " bg-red-300 fa-microphone-slash")
          }
        // onClick={ acceptWithVideo(false) }
        />
      </div>
      {/* { console.log('rendering the tile') } */ }
    </div>
    <div className="p-2 h-8 text-black bg-yellow-100" >
      { displayLegend() }
    </div>
  </React.Fragment >
}

export default VideoTile