import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

// element-ui的全部组件
import ElementUI from 'element-ui'
// element-ui的css
import 'element-ui/lib/theme-chalk/index.css'
import Qs from 'qs'
// 使用elementUI
Vue.use(ElementUI)

axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1'
// axios.defaults.baseURL = 'http://106.12.11.162:8888/api/private/v1/'
// window.axios = require('axios')
// Vue.prototype.$http = axios
Vue.prototype.$axios = axios
Vue.prototype.qs = Qs

axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
