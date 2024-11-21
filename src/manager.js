import Vue from 'vue'
import Axios from 'axios'
import VueAxios from 'vue-axios'
import ElementUI from 'element-ui'
import VueBus from 'vue-bus'
import VueRouter from 'vue-router'
import store from './store/'
import routes from './router/manager'
import App from './Manager.vue'
import VueRx from 'vue-rx'
import EasyFilter from 'easy-filter'

import '@/style/index.scss'
import '@/style/element.scss'
import Parse from 'parse'

const { VUE_APP_PARSE_ID, VUE_APP_PARSE_URL, VUE_APP_PARSE_KEY } = process.env
Parse.initialize(VUE_APP_PARSE_ID, VUE_APP_PARSE_KEY)
Parse.serverURL = VUE_APP_PARSE_URL

const router = new VueRouter({
  routes // (缩写) 相当于 routes: routes
})

router.beforeEach(async (to, from, next) => {
  var accessRoles = _.get(to, 'meta.roles')
  var { roles } = await store.dispatch('user/getUser')

  if (_.isArray(roles)) {
    if (_.isEmpty(currentUser)) {
      return next('/login')
    } else {
      if (_.intersection(accessRoles, roles).length <= 0) {
        return next('/403')
      }
    }
  }

  next()
})

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(ElementUI)
Vue.use(VueBus)
Vue.use(VueRx)
Vue.use(VueAxios, Axios)
Vue.use(EasyFilter)

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
