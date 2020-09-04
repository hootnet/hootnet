const effects = {
  actions: null,
  state: {},
  setActionsAndState: (actions, state) => {
    effects.actions = actions
    effects.state = state
  },
  
}

export default effects