import React, { useEffect } from 'react';
import { useApp, proxyMethods } from './app'
import { json } from 'overmind'
import VideoTile from './VideoTile'


const VideoTiles = () => {
  const { state, actions, effects } = useApp()
  const [stream, setStream] = React.useState(null)
  const [refs, setRefs] = React.useState({})
  if (!state.sessions.allSessions) return null
  return <React.Fragment>
    <div className="flex" >

      { state.sessions.allSessions.map((key, index) => {
        const user = json(state.users[key])
        if (!user) return null
        // console.log("muted", user.name, key === state.attrs.id)
        return <div key={ key } className="flex-col m-2 h-25 place-content-center" >
          <VideoTile id={ key } />
        </div>
      }) }
    </div>

  </React.Fragment>
}

export default VideoTiles