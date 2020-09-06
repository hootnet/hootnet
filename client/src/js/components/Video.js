import React from "react";
import { useApp } from "../app";


let Video = (props) => {
  const { state, actions } = useApp();
  const ref = React.useRef(null);
  let { stream, streamName } = props
  const [initialized, setInitialized] = React.useState(false)
  if (!stream && !streamName) streamName = "localStream"


  React.useEffect(() => {
    if (ref && ref.current) {
      const video = ref.current
      if (!initialized) {
        setInitialized(true)
        const events = props.watch
        if (events) {
          for (let name in events) {
            const cb = events[name]
            video.addEventListener(name, cb)
          }
        }
      }
      if ((stream || state.streams[streamName])) {
        if (streamName) {
          video.srcObject = actions.getStream(streamName)
        } else {
          video.srcObject = stream
        }
      }
    }
  }, [ref, initialized, stream, state.streams[streamName]]);
  const callBackNames = `
audioprocess
canplay
canplaythrough
complete
durationchange
emptied
error
ended
loadeddata
loadedmetadata
pause
play
playing
progress
ratechange
seeked
seeking
stalled
suspend
timeupdat
volumechange
waiting`.split("\n")

  return (
    <React.Fragment>
      <video
        ref={ ref }
        autoPlay
        { ...props }
      />
    </React.Fragment>
  );
};




export default Video;
