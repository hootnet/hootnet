
interface WebTiming {
  timingObject: any
}
class WebTiming {
  constructor() {
    this.timingObject = null
    // var APPID_MCORP = '8456579076771837888';
    var APPID_MCORP = "1535466832002245738";
    //@ts-ignore
    let app = window.MCorp.app(APPID_MCORP, { anon: true });
    app.run = function () {
      run(app.motions.room2);
    };
    app.init();
    const thisWT = this;
    //@ts-ignore
    const run = function (timingProvider) {
      //@ts-ignore
      const myTo = new window.TIMINGSRC.TimingObject({
        provider: timingProvider,
        range: [0, 1000]
      });
      thisWT.timingObject = myTo
      console.log("TIMING OBJECT", myTo)
      //@ts-ignore
      if (thisWT.onTimingObject) thisWT.onTimingObject(myTo);
    };
  }
  getTime() {

  }
}

export default WebTiming