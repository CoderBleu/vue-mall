import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
import axios from 'axios'

// element-ui的全部组件
import ElementUI from 'element-ui'
// element-ui的css
import 'element-ui/lib/theme-chalk/index.css'
// 使用elementUI
Vue.use(ElementUI)

// axios.defaults.baseURL = 'http://106.12.11.162:8888/api/private/v1/'
// window.axios = require('axios')
Vue.prototype.$axios = axios
// Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
