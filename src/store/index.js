import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import drawing from './modules/drawing'
import style from './modules/style'
import maps from './modules/maps'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    drawing,
    style,
    maps
  }
})