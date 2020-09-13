import React from "react";
import StreamRecorder from "./StreamRecorder";
import Button from "@material-ui/core/Button";
import { useApp } from '../app'


export default function StreamRecorderDemo() {
  const gumVideo = React.useRef(null);
  const [source, setSource] = React.useState("none");
  const { state, actions } = useApp()

  return (
    <div id="container">

      <button
        className="bg-blue-400 m-4 p-2 border border-black border-size-2 border-rounded "
        id="start"
        onClick={ () => setSource("local") }
      >
        Start camera
      </button>
      <button
        className="bg-blue-400 m-4 p-2 border border-black border-size-2 border-rounded "
        id="start"
        onClick={ () => setSource("desktop") }
      >
        Record Desktop
      </button>
      <button
        className="bg-blue-400 m-4 p-2 border border-black border-size-2 border-rounded "
        id="start"
        onClick={ actions.toggleRecorder }
      >
        Close
      </button>
      <StreamRecorder autoStart={ false } source={ source } monitor={ true } />

    </div>
  );
}
