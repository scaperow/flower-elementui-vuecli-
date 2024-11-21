import Vue from 'vue'
import Share from './Share.vue'
import Parse from 'parse'
import routes from './router/share'
import VueRouter from 'vue-router'
import directive from 'element-ui/packages/loading/src/directive'
const { VUE_APP_PARSE_ID, VUE_APP_PARSE_URL, VUE_APP_PARSE_KEY } = process.env
Parse.initialize(VUE_APP_PARSE_ID, VUE_APP_PARSE_KEY)
Parse.serverURL = VUE_APP_PARSE_URL
Vue.directive('loading', directive)


Vue.config.productionTip = false

new Vue({
  render: h => h(Share)
}).$mount('#app')
