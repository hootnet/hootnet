let _state, _actions
let testMessage = "no test"
const test = (message, fn) => {
  const state = _state
  const actions = _actions
  testMessage = message
  //Add rewriting code, maybe later
  // const modText = fnText.split("\n").slice(1, -1).join("\n")
  // const fnText = fn + ""
  // console.log("fUNCTON GEING BEStED", modText)
  let logMessage
  let style
  try {
    fn()
    logMessage = "✅ %c" + message
    style = "color: green; font-style: italic; background-color: white"
    // eval(modText)
  } catch (e) {
    logMessage = "❌ %c" + message + " " + e.message
    style = "color: red; font-style: italic; background-color: white"
  }
  state.tests.testResults.push({ message, style })
  console.log(logMessage, style)
  //
}
class expecterator {
  constructor(value) {
    this.original = value
  }
  toBe(value) {
    if (value === this.original) return
    throw new Error("Expected " + this.original + " got " + value)
  }
}
const expect = (value) => {
  return new expecterator(value)
}
const config = {
  state: {
    testResults: [],

  },
  actions: {
    _init({ state, actions }) {
      _state = state
      _actions = actions
    },
    clearResults({ state, actions }) {
      actions.tests._init(state, actions)
      state.tests.testResults = []
    },
    _sessionOfName({ state, actions }) {
      actions.tests._init(state, actions)

      // actions.tests._init()
      test('checks session returns', () => {
        //comment here does it matter 
        expect(actions.sessionOfName(state.attrs.id)).toBe(state.attrs.id)
      });
      test('test name, if name defined', () => {
        //comment here does it matter 
        if (state.attrs.name) expect(actions.sessionOfName(state.attrs.name)).toBe(state.attrs.id)
      });
      test('error on random ID', () => {

        //comment here does it matter 
        expect(actions.sessionOfName(state.attrs.id)).toBe("394343343")
      });

      // console.log(state, actions)
      // console.log("Session", actions.sessionOfName(state.attrs.id))
      // console.log("Session", actions.sessionOfName(state.attrs.name))
      // try {
      //   console.log("Session", actions.sessionOfName("session-16"))
      // } catch (e) {
      //   console.log("Caught errror", e)
      // }
    }
  }
}
export default config