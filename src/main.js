// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui';
import KZUI from '@kuaizi/kz-ui/lib/components'
import '@kuaizi/kz-ui/lib/theme-kz.css'
Vue.use(ElementUI)
Vue.use(KZUI)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
