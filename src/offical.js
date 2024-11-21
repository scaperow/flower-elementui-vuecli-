import Vue from 'vue'
import Axios from 'axios'
import VueAxios from 'vue-axios'
import Offical from './Offical.vue'
import routes from './router/offical'
import Parse from 'parse'
import './style/offical.scss'

const { VUE_APP_PARSE_ID, VUE_APP_PARSE_URL, VUE_APP_PARSE_KEY } = process.env
Parse.initialize(VUE_APP_PARSE_ID, VUE_APP_PARSE_KEY)
Parse.serverURL = VUE_APP_PARSE_URL

Vue.config.productionTip = false
Vue.use(VueAxios, Axios)

new Vue({
  routes,
  render: h => h(Offical)
}).$mount('#app')
