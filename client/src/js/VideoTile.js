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
      <video ref={ ref }
        autoPlay muted={ id === state.attrs.id } />
    )
  }
  return <React.Fragment>
    <div style={ { opacity: state.users[id].opacity } } className=" text-black bg-gray-800 h-32 ">
      { displayTile(state.users[id].roomStatus) }
      {/* { console.log('rendering the tile') } */ }
    </div>
    <div className="p-2 h-8 text-black bg-yellow-100" >
      { displayLegend() }
    </div>
  </React.Fragment >
}

export default VideoTile