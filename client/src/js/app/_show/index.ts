const state = {
  component: {
    registration: true,
    director: false
  },
  page: {
    page: "main",
    testPage: ""
  }
}

const actionList = {
  _showComponent({ state }, { component, value }) {
    //Handle case of event callback
    if (typeof value === 'object') value = undefined
    if (value === undefined) value = !state._show.component[component]
    state._show.component[component] = value
  },
  showRegistration({ actions }, value?: any) {
    actions._show._showComponent({ component: 'registration', value })
  },
  showDirector({ actions }, value?: any) {
    actions._show._showComponent({ component: 'director', value })
  }
}
export default {
  state,
  actions: actionList
}