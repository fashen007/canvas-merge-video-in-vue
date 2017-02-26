<template>
  <div id="app">
  <merge-video :autoPlay='autoPlay' :playList='playList' :sounds='sounds'>
  </div>
</template>
<script>
import Vue from 'vue'
import MergeVideo from '../dist/canvasMergeVideo.js'
Vue.use(MergeVideo)
export default {
  name: 'app',
  data () {
    return {
      autoPlay: true, // 是否自动播放
      playList: [],
      sounds: 50
    }
  },
  mounted: function () {
    this.getData()
  },
  methods: {
    getData: function () {
      const that = this
      setTimeout(() => {
        that.playList = [{
          src: 'http://www.w3school.com.cn/example/html5/mov_bbb.mp4',
          duration: 10, // 长度
          position: 53 // 节点
        }, { // 碎片资源列表  这个是需要后端返回的
          src: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
          duration: 52, // 长度
          position: 0 // 节点
        }, {
          src: 'https://www.w3schools.com/html/movie.mp4',
          duration: 12,
          position: 63
        }, {
          src: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
          duration: 60,
          position: 75
        }]
      }, 2000)
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
