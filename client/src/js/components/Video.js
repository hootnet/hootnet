import React from "react";
import { useApp } from "../app";


let Video = (props) => {
  const { state, actions } = useApp();
  const ref = React.useRef(null);
  let { stream, streamName } = props
  if (!stream && !streamName) streamName = "localStream"



  React.useEffect(() => {
    console.log("Assign", { streamName, ref, stream })

    if (ref && ref.current && (stream || state.streams[streamName])) {
      console.log("Assign", ref.currrent, stream, streamName)
      if (streamName) {
        ref.current.srcObject = actions.getStream(streamName)
      } else {
        ref.current.srcObject = stream
      }
    }
  }, [ref, stream, state.streams[streamName]]);
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
      <h1 className="bg-black" id="VIDEO">
        { console.log("render video") }
        this is the video component
        </h1>
      <video
        ref={ ref }

        { ...props }
      />
    </React.Fragment>
  );
};




export default Video;
