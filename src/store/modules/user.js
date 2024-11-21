
import Parse from 'parse'

const state = {
  user: null
}

// getters
const getters = {
  user: (state, getters) => {
    return state.user
  }
}

// actions
const actions = {
  updateAvatar ({ state, commit }, avatar) {
    commit('UPDATE_AVATAR', avatar)
  },
  setUser ({ state, commit }, user) {
    commit('SET_USER', user)
  },
  async getUser ({ state, commit }) {
    let user = state.user

    if (!user) {
      user = Parse.User.current()

      if (user) {
        user = user.toJSON()
        commit('SET_USER', user)
      }
    }

    return user
  },
  async logout ({ commit }) {
    await Parse.User.logOut()
    commit('SET_USER', null)
  }
}

// mutations
const mutations = {
  SET_USER (state, user) {
    state.user = user;
  },
  UPDATE_AVATAR (state, avatar) {
    state.user = { ...state.user, avatar }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}