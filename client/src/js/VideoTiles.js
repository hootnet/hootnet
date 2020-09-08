import React, { useEffect } from 'react';
import { useApp, proxyMethods } from './app'
import { json } from 'overmind'
import VideoTile from './VideoTile'


const VideoTiles = () => {
  const { state, actions, effects } = useApp()
  const [stream, setStream] = React.useState(null)
  const [refs, setRefs] = React.useState({})
  return <React.Fragment>
    <div className="flex" >

      { Object.keys(state.users).map((key, index) => {
        const user = json(state.users[key])
        if (!user) return null
        // console.log("muted", user.name, key === state.attrs.id)
        return <div key={ key } className="m-2 h-25 w-1/4" >
          <VideoTile id={ key } />
        </div>
      }) }
    </div>

  </React.Fragment>
}

export default VideoTiles