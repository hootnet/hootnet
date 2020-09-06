// import jest from 'jest'
const config = {
  state: {

  },
  actions: {
    _sessionOfName({ state, actions }) {
      test('checks session returns', () => {
        expect(actions.sessionOfName(state.attrs.id)).toBe(state.attrs.id)
      });

      console.log(state, actions)
      console.log("Session", actions.sessionOfName(state.attrs.id))
      console.log("Session", actions.sessionOfName(state.attrs.name))
      try {
        console.log("Session", actions.sessionOfName("session-16"))
      } catch (e) {
        console.log("Caught errror", e)
      }
    }
  }
}
export default config