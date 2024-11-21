import Vue from 'vue'
import Axios from 'axios'
import VueAxios from 'vue-axios'
import ElementUI from 'element-ui'
import VueBus from 'vue-bus'
import VueRouter from 'vue-router'
import store from './store/'
import routes from './router/app'
import App from './App.vue'
import VueRx from 'vue-rx'
import EasyFilter from 'easy-filter'
import '@/style/index.scss'
import '@/style/element.scss'
import 'vuetify/dist/vuetify.min.css'
import Parse from 'parse'
import ErrorHandler from '@/utils/error'
import Vuetify from 'vuetify'
import Validators from '@/utils/validators'
// import './vuetify'

const { VUE_APP_PARSE_ID, VUE_APP_PARSE_URL, VUE_APP_PARSE_KEY } = process.env
Parse.initialize(VUE_APP_PARSE_ID, VUE_APP_PARSE_KEY)
Parse.serverURL = VUE_APP_PARSE_URL

const router = new VueRouter({
  routes
})

router.beforeEach(async (to, from, next) => {
  var user = await store.dispatch('user/getUser')

  if (_.isEmpty(user)) {
    if (to.path !== '/login') {
      return next('/login')
    } else {
      return next()
    }
  } else {
    var roles = user.roles
    var accessRoles = _.get(to, 'meta.roles')

    if (!_.isEmpty(accessRoles) && _.intersection(accessRoles, roles).length <= 0) {
      return next('/403')
    }

    next()
  }
})

Vue.config.productionTip = false

Vue.use(ErrorHandler,
  {
    handleDirect (url) {
      router.push(url)
    },
    handleError (message) {
      ElementUI.Message({
        message,
        type: 'error'
      })
    },
    handleNotify (message) {
      ElementUI.Notification({
        message
      })
    },
    handleWarning (message) {
      ElementUI.Message({
        type: 'warning',
        message
      })
    },
    handleBlock (message) {
      let box = ElementUI.MessageBox({
        message,
        showCancelButton: false,
        showConfirmButton: false,
        closeOnPressEscape: false,
        closeOnClickModal: false,
        roundButton: true
      })

      return {
        close () {
          box.close()
        }
      }
    },
    handleConfirm (message) {
      return ElementUI.MessageBox({
        message,
        roundButton: true
      })

    }
  }
)

Vue.use(Vuetify)
Vue.use(VueRouter)
Vue.use(ElementUI)
Vue.use(VueBus)
Vue.use(VueRx)
Vue.use(VueAxios, Axios)
Vue.use(EasyFilter)
Vue.use(Validators)

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
