const config = {
  state: {
  },
  actions: {
    _ensure({ state }, id: string) {
      if (!state._resources[id]) state._resources[id] = {
        created: 0,
        started: 0,
        stopped: 0
      }
    },
    created({ state, actions }, id: string) {
      actions._resources._ensure(id)
      state._resources[id].created++
    },
    started({ state, actions }, id: string) {
      actions._resources._ensure(id)
      state._resources[id].started++
    },
    stopped({ state, actions }, id: string) {
      actions._resources._ensure(id)
      state._resources[id].stopped++
    }
  }

}
export default config