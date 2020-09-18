//@ts-ignore
import React from "react";
import WebTiming from "./WebTiming";


function App() {
  const [time, setTime] = React.useState(null);
  const [timingObject, setTimingObject] = React.useState(null);
  React.useEffect(() => {
    const wt = new WebTiming();
    //@ts-ignore
    wt.onTimingObject = (timingObject) => {
      setTimingObject(timingObject);
      timingObject.on("timeupdate", function () {
        setTime(timingObject.query());
      });
    };
  }, []);
  const onClick = function (e) {
    var elem,
      evt = e;
    if (evt.srcElement) elem = evt.srcElement;
    else if (evt.target) elem = evt.target;
    if (elem.id === "reset") timingObject.update({ position: 0.0 });
    else if (elem.id === "pause")
      timingObject.update({ velocity: 0.0, acceleration: 0.0 });
    else if (elem.id === "play")
      timingObject.update({ velocity: 1.0, acceleration: 0.0 });
    else if (elem.id === "end") timingObject.update({ position: 10000.0 });
    else {
      // relative
      var v = timingObject.query();
      if (elem.id === "p-") timingObject.update({ position: v.position - 1 });
      else if (elem.id === "p+") timingObject.update({ position: v.position + 1 });

    }
  };
  return (
    <div className="text-black">
      <p className="m-2 border border-black" id="buttons" onClick={ onClick }>
        { "reset,pause,play,end,p-,p+".split(',').map(id => <button className="m-1 bg-white w-12 border border-black" key={ id } id={ id }>{ id }</button>)
        }
        {/* <button id="reset">Reset</button>
        <button id="pause">Pause</button>
        <button id="play">Play</button>
        <button id="end">End</button>
        <button id="p-">Pos-1</button>
        <button id="p+">Pos+1</button>
        <button id="v-">Vel-1</button>
        <button id="v+">Vel+1</button>
        <button id="a-">Acc-1</button>
        <button id="a+">Acc+1</button> */}
      </p>
      <div id="position" style={ { fontWeight: "bold" } }>
        { time ? time.position.toFixed(3) : "" }
      </div>
    </div>
  )
}
export default App;
