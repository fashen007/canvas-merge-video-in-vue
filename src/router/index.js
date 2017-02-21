import Vue from 'vue'
import Router from 'vue-router'
import MergeVideo from 'components/MergeVideo'
Vue.use(Router)
export default new Router({
  routes: [
    {
      path: '/',
      name: 'mergeVideo',
      component: MergeVideo
    }
  ]
})
