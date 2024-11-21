
import Parse from 'parse'
import _ from 'lodash'

const MapsClass = Parse.Object.extend('maps')

const state = {
  list: []
}

// getters
const getters = {
  list: (state) => state.list
}

const actions = {
  async getList ({ commit, state }) {
    var list = []

    if (_.isEmpty(state.list)) {
      list = await new Parse.Query(MapsClass).find()

      commit('SET_LIST', list)
    }

    return list
  }
}


// mutations
const mutations = {
  SET_LIST (state, list) {
    state.list = list
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}