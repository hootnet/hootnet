import isEqual from 'lodash/isEqual'
let _state, _actions
let testMessage = "no test"
const init = (state, actions) => {
  _state = state
  _actions = actions
}
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
    // console.log("TOBE ", value, this.original)
    if (typeof value === "object") {
      if (isEqual(this.original, value)) return
    } else {
      if (value === this.original) return
    }
    throw new Error("Expected " + this.original + " got " + value)
  }
}
const expect = (value) => {
  // console.log("EXPECT", value)
  return new expecterator(value)
}
export { expect, test, init }