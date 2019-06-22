import Vue from 'vue'
import Axios from 'axios'
import VueAxios from 'vue-axios'
import ElementUI from 'element-ui'
import VueBus from 'vue-bus'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import store from './store/'
import routes from './router/'
import App from './App.vue'
import VueRx from 'vue-rx'

import 'element-ui/lib/theme-chalk/index.css';
import 'font-awesome/css/font-awesome.css'
import '@/style/graph.css'
import '@/style/index.scss';

const router = new VueRouter({
  routes // (缩写) 相当于 routes: routes
})

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(ElementUI)
Vue.use(VueBus)
Vue.use(VueRx)
Vue.use(VueAxios, Axios)

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
