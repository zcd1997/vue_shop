import Vue from 'vue';
import App from './App.vue';
import router from './router';
import './plugins/element.js';
// 导入全局样式表
import '../src/assets/css/global.css';
import '../src/assets/fonts/iconfont.css';
// 树形组件
import TreeTable from 'vue-table-with-tree-grid'
// 富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

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

Vue.use(VueQuillEditor)

Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDay() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
// // 定义全局的过滤器
// Vue.filter('dateFormat', function (dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
//   return moment(dataStr).format(pattern)
// })
new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
