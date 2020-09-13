const config = {
  state: {
    resource: {},
  },
  actions: {
    _ensure({ state }, id) {
      if (!state.resource[id]) state.resource.id = {
        created: 0,
        started: 0,
        stopped: 0
      }
    },
    create({ state, actions }, id) {
      actions._ensure(id)
      state.resource[id].created++
    },
    started({ state, actions }, id) {
      actions._ensure(id)
      state.resource[id].started++
    },
    stopped({ state, actions }, id) {
      actions._ensure(id)
      state.resource[id].stopped++
    }
  }

}
export default config