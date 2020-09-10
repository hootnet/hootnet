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
    _connectCascade({ actions }) {
      test('sees if cascade is connected properly', () => {
        actions.relayAction({ to: state.attrs.id, op: 'doAction', data: { action: 'diag', data: 'this is a test' } })
      })

    },
    _setMessage({ actions, state }) {
      actions.tests._init(state, actions)
      state._message.delay = 1000
      setTimeout(() => actions.setMessage("message 1"), 1000)
      setTimeout(() => actions.setError("Error"), 2500)

      setTimeout(() => {
        state._message.delay = 5000
        actions.setWarning("A warning")
      }, 5000)

    },
    _setCascadeOrder({ state, actions }) {
      actions.tests._init(state, actions)
      state.users['s1'] = { name: 'Goober' }
      state.users['s2'] = { name: 'Quz' }
      state.users['s3'] = { name: 'Zooby' }

      test('checks comma list of actions', () => {
        // expect(actions.sessionOfName(state.attrs.id)).toBe(state.attrs.id)
        actions.setCascadeOrder('Goober,Quz,Zooby')
        expect(state.sessions.cascaders.join(':')).toBe('s1:s2:s3')
      })
      's1,s2,s3'.split(',').map(key => delete state.users[key])
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