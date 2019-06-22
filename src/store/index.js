import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import drawing from './modules/drawing'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    drawing
  }
})