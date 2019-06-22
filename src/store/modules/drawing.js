import Go from 'gojs'
import _ from 'lodash'
const state = {
  status: null,
  canvas: null,
  selection: [],
  setting: {
    // page setting
    root: {
      direction: 'H',
      size: null,
      units: 'px',
      showRule: true,// 是否显示参考线
      showMesh: true,// 是否显示网格
      meshColor: '#409EFF',
      ruleColor: '#000',
      background: '#fff'
    },
    // default setting
    common: {
      fontSize: '12px'
    },
    canvas: {
    },
    shape: {
    },
  }
}

// getters
const getters = {
  status: (state, getters) => {
    return state.status
  },
  setting: (state) => {
    return state.setting
  },
  selection: (state) => {
    return state.selection
  },
  canvas: (state) => {
    return state.canvas
  }
}

// actions
const actions = {
  command ({ state, commit }, commander) {

  },
  /**
   * 改变工具栏状态
   * @param {*} param0 
   * @param {*} status 
   */
  setStatus ({ state, commit }, status) {
    commit('SET_STATUS', status)
  },
  setSetting ({ state, commit }, set) {
    commit('SET_SETTING', set)
  },
  setCanvas ({ state, commit }, canvas) {
    commit('SET_CANVAS', canvas)
  },
  setSelection ({ state, commit }, selection) {
    commit('SET_SELECTION', selection)
  }
}

// mutations
const mutations = {
  SET_SETTING (state, set) {
    _.each(set, (value, key) => _.set(state.setting, key, value))
    //state.setting = Object.assign(state.setting, set)
  },
  SET_CANVAS (state, status) {
    state.canvas = status
  },
  SET_SELECTION (state, selection) {
    state.selection = selection
  },
  SET_CANVAS (state, canvas) {
    state.canvas = canvas
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}