<template>
  <div id="app">
  <merge-video :autoPlay='autoPlay' :playList='playList' :sounds='sounds' :audioSrc='audioSrc' :picOption='picOption'></merge-video>
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
      picOption: {
        editLogo: true, // // 是否需要调整水印
        logoSrc: require('./assets/logo.png'),
        info: {
          w: 60,
          h: 60
        } // 图片信息
      },
      autoPlay: true, // 是否自动播放
      playList: [],
      sounds: 0,
      audioSrc: 'http://m2.music.126.net/kP1oR0-NH0NGJpLIBzDUmQ==/3413983646810312.mp3'
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
          position: 0 // 视屏在所有碎片视频长度中的开始节点
        }, { // 碎片资源列表  这个是需要后端返回的
          src: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
          duration: 52, // 长度
          position: 11 // 节点
        }, {
          src: 'https://www.w3schools.com/html/movie.mp4',
          duration: 12,
          position: 63
        }, {
          src: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
          duration: 60,
          position: 75
        }, {
          src: 'http://godsong.bs2dl.yy.com/dmZlNTY3Y2VjZWRlNDM3NGM4MzNkZGE3OGJmYTJhYTVkMTIwMjY0NDI1N21j',
          duration: 50,
          position: 135
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
.pic-adjust {
  overflow: hidden;
  width: 404px;
  margin: 0 auto;
}
.pic-adjust .wrap {
  position: relative;
  overflow: hidden;
  border: 1px solid #999;
  height: 202px;
}
</style>
