import Vue from 'vue';
import App from './App.vue';
import router from './router';
import './plugins/element.js';
// 导入全局样式表
import '../src/assets/css/global.css';
import '../src/assets/fonts/iconfont.css';

import TreeTable from 'vue-table-with-tree-grid'

// 配置axios
import axios from 'axios';
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
axios.interceptors.request.use(config => {
  // 最后必须return config
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios;

Vue.config.productionTip = false;

Vue.component('tree-table', TreeTable);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
