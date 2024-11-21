import Go from 'gojs'
import Parse from 'parse'
import _ from 'lodash'

const state = {
  map: null,
  mapSource: null,
  mapData: null,
  history: null
}

// getters
const getters = {
  map: (state) => state.map,
  mapSource: (state) => state.mapSource,
  mapData: (state) => state.mapData,
  history: (state) => state.history
}

const actions = {
  setMap ({ state, commit }, map) {
    commit('SET_MAP', map)
  },

  setMapSource ({ state, commit }, source) {
    commit('SET_MAP_SOURCE', source)
  },

  setHistory ({ state, commit }, history) {
    commit('SET_HISTORY', history)
  }
}


// mutations
const mutations = {
  SET_MAP (state, map) {
    state.map = map
  },

  SET_MAP_SOURCE (state, source) {
    state.mapSource = source
    state.mapData = source.toJSON()
  },

  SET_HISTORY (state, source) {
    state.history = source
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}