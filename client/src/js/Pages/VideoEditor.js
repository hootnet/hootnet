import React from "react";

import MoveableBox from "./MoveableBox";
const from = "chat";

const StreamBoxes = ({ streams }) => {
  // const { state } = useApp();

  return (
    <React.Fragment>
      {/* <MoveableContents stream={streams[0]} />} */}
      {streams.map((stream, index) => {
        // const member = state.rooms.members[key];
        console.log("Stream", stream) 
        return (
          <div key={index}>
            <MoveableBox
              pos={index}
              Contents={() => <MoveableContents stream={stream} />}
            />
          </div>
        );
      })}
    </React.Fragment>
  );
};
const MoveableContents = ({ stream }) => {
  // const { actions, state } = useApp();
  return (
    <React.Fragment>
      <video
        // width={"25%"}
        className="w-100"
        ref={(el) => {
          if (el && !el.srcObject && stream) el.srcObject = stream;
        }}
        autoPlay
      />
    </React.Fragment>
  );
};
const EditorPage = ({ streams }) => {
  // const { state, actions } = useApp();
  console.log("streams in ", streams);
  return (
    <div className="container mx-auto bg-blue-100">
      <div className="container h-100  mx-auto bg-red-100">
        Chat
        <StreamBoxes filter="none" streams={streams} />
      </div>
    </div>
  );
};

const VideoEditor = () => {
  const [streams, setStreams] = React.useState([]);
  const openUserMedia = () => {
    const constraints = {
      audio: true,
      video: true
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        setStreams([stream,stream]);
        console.log("device", stream.getTracks());
      })
      .catch((e) => console.log(e.toString()));
  };
  React.useEffect(() => openUserMedia(), []);
  return <EditorPage streams={streams} />;
};
export default VideoEditor;
