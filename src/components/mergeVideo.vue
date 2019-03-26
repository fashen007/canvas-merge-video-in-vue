<template>
  <div style='overflow: hidden; position: relative;'>
    <video class="video" width="270" :src="video.src" style='display: none' :poster="poster" v-for="(video, index) in playList" :key='index' :id='`originVideo-${index}`' playsinline webkit-playsinline>
    </video>
    <div class='video-cont' v-loading="loading">
      <!-- <video class="video" :width="width" id='my-video' style="display: none" playsinline webkit-playsinline>
        <source :src="playList[0] ? playList[0].src : ''" type='video/mp4'>
      </video> -->
      <canvas controls id="myCanvas" width='400' height='200' style="border:1px solid #d3d3d3;">Your browser does not support the HTML5 canvas tag.</canvas>
      <div class='play-icon' :class='currentVideo && currentVideo.isPlaying ? "is-playing" : "is-pausing"' @click="changeStatus">
        <i class='kz-icon-zanting' v-if='isPlaying && showPlayingIcon'></i>
        <i class='kz-icon-kaishi' v-else></i>
      </div>
      <video-control v-if='showContr' :time='hasPlayTime' :endTime='endTime' @dragProgress='dragProgress' :showSounds='showSounds'></video-control>
    </div>
    <audio :src="audioSrc" preload="auto" style='display: none' id='insertAudio'></audio>
</div>
</template>

<script>
import videoControl from './video-control.vue'
import waterMark from './water-mark.vue'
import screenfull from 'screenfull'
import VideoPlayer from './video-player.js'
var drawTimerInterval = null
var progressInterval = null
export default {
  name: 'MergeVideo',
  components: {
    videoControl,
    waterMark
  },
  props: {
    picOption: {
      type: Object,
      default: {
        editLogo: true
      }
    },
    autoPlay: {
      type: Boolean,
      default: false
    },
    playList: {
      type: Array,
      default: []
    },
    width: {
      type: Number,
      default: 270
    },
    height: {
      type: Number,
      default: 0
    },
    sounds: {
      type: Number,
      default: 20
    },
    showSounds: {
      type: Boolean,
      default: true
    },
    showContr: {
      type: Boolean,
      default: true
    },
    audioSrc: {
      type: String,
      default: ''
    },
    poster: {
      type: String,
      default: ''
    }
  },
  mounted () {
    this.progressSetTimeout = null
    this.hasPlayTime = 0
    this.cv = document.getElementById('myCanvas')
    this.audioSrc && this.audioInit()
    this.imageInterval = null
  },
  data () {
    return {
      isFullscreen: false, // 全屏
      hasPlayTime: 0, // 当前播放时长
      endTime: 0, // 总长度.这个是需要后端返回的
      currentTime: 0, // 当前时间
      currentIndex: '', // 默认当前播放碎片指引
      loading: true, // loading状态
      isPauseing: true, // 暂停状态
      audioPlaying: false, // 音频播放状态
      mutedable: false, // 是否静音
      showPlayingIcon: false, // 是否展示播放按钮
      isPlaying: false // 播放状态
    }
  },
  watch: {
    autoPlay: {
      immediate: true,
      handler  (val) {
        this.isPlaying = val
        this.showPlayingIcon = !val
      }
    },
    playList: function (newVal, oldVal) {
      if (newVal.length && newVal != oldVal) {
        this.playList.map((item, index) => {
          this.endTime = this.endTime + item.duration
        })
        this.$nextTick(() => {
          this.playList.map((item, index) => {
            let videoInstance = document.getElementById('originVideo-' + index)
            item.canvasInstance = new VideoPlayer(videoInstance, this.cv, {
              end: (e) => this.videoEndedHandle(e, index),
              loadedmetadata: (e) => this.videoLoadedmetadataHandle(e, index),
              canplay: (e) => this.videoCanplayHandle(e, index),
              play:  (e) => this.videoPlayHandle(e, index),
              pause:  (e) => this.videoPauseHandle(e, index),
              seeked:  (e) => this.videoPauseHandle(e, index),
            })
            this.currentIndex = 0
           })
          this.triggerPlay()
        })
      }
    },
    currentTime: function (newVal, oldVal) {
      const that = this
      if ((newVal != oldVal) && !this.isPauseing) {
        let diff = newVal - oldVal
        this.loading = false
        this.hasPlayTime = this.hasPlayTime + (diff > 0 ? (diff > 0.02 ? 0.02 : diff) : 0)
      }
    },
    sounds: function (newVal, oldVal) {
      if (this.audioSrc) { // 如果存在插入音频 视频的音量设置为零
        this.audioInstance.volume = newVal / 100
      } else {
        this.videoInstance.volume = newVal / 100
      }
    }
  },
  computed: {
    currentVideo () {
      let back = this.playList[this.currentIndex] && this.playList[this.currentIndex].canvasInstance
      return back
    }
  },
  methods: {
    // 视频play监听回调
    videoPlayHandle (e, index) {
      this.isPauseing = false
      this.currentVideo.isPlaying = true
      this.drawStart()
      this.audioSrc && this.audioInstance.play()
    },
    // 视频pause监听回调
    videoPauseHandle (e, index) {
      this.isPauseing = true
      this.playList[index].canvasInstance.isPlaying = false
      // this.currentVideo.isPlaying = false
    },
    videoSeekedHandle (e, index) {
      
    },
    // 视频ended监听回调
    videoEndedHandle (e, index) {
      let videoItem = this.playList[index]
      videoItem.canvasInstance.isPlaying = false
      if (index < this.playList.length - 1) {
        this.currentIndex ++
        this.currentVideo.play()
      } else {
        this.isPauseing = true
      }
    },
    // 视频canplay监听回调
    videoCanplayHandle (e, index) {
      let videoItem = this.playList[index]
      videoItem.enoughToPlay = true
      this.loading = false
      if (this.autoPlay || (index && index === this.currentIndex)) {
        videoItem.canvasInstance.play()
      }
      // 提前加载
      if (index + 1 < this.playList.length && !this.playList[index + 1].enoughToPlay) this.playList[index + 1].canvasInstance.load()
    },
    // 视频加载元数据
    videoLoadedmetadataHandle (e, index) {
      if (!index && !this.poster) {
        this.captureFisrt()
      }
    },
    // 视频Waiting监听回调
    videoWaitingHandle () {
      console.log('videoWaitingHandle')
      this.isPauseing = true
      this.loading = true
      if (this.audioSrc) {
        this.audioInstance.pause()
      }
    },
    audioInit () {
      this.audioInstance = document.getElementById('insertAudio')
      // 音频play监听回调
      let audioPlayHandle = () => {
        this.audioPlaying = true
      }
      // 音频pause监听回调
      let audioPauseHandle = () => {
        this.audioPlaying = false
      }
      // 播放
      this.audioInstance.addEventListener('play', audioPlayHandle, false)
      // 暂停
      this.audioInstance.addEventListener('pause', audioPauseHandle, false)
    },
    // 绘制首屏视频
    captureFisrt () {
      // this.currentVideo.drawFrame()
    },
    // 播放或者暂停
    changeStatus () {
      if (!this.currentVideo.isPlaying) {
        this.currentVideo.play()
      } else {
        console.log('能暂停吗？')
        this.currentVideo.pause()
      }
    },
    drawStart () {
      const that = this
      // this.clearIntervaler()
      if (!drawTimerInterval) {
        drawTimerInterval = window.setInterval(() => {
          that.currentTime = that.currentVideo.videoDom.currentTime
        }, 20)  // 每0.02秒画一张图片
      }
      if (!progressInterval) {
        progressInterval = window.setInterval(() => {
          that.progress = Math.floor(that.hasPlayTime)
        }, 200)  // 每1秒画统计一次时间条
      }
    },
    dragProgress (val) {
      if (val == Math.floor(this.hasPlayTime)) return // 表示是自动播放过程
      // 拖拽了
      // this.clearIntervaler()
      this.isPauseing = true
      this.currentVideo.pause() // 当拖拽的是 视频应该暂停,不然声音还一直播放
      if (this.audioSrc) {
        this.audioInstance.pause() // 当拖拽的是 视频应该暂停,不然声音还一直播放
      }
      // 拖动进度条
      let timeLens = 0
      for (let i = 0; i < this.playList.length; i++) {
         // 判断当前滑点在哪个视频源上
        if (timeLens >= val) {
          this.currentIndex = i
          this.$nextTick(() => {
            this.currentVideo.currentTime = timeLens - val
            this.currentVideo.drawFrame()
          })
          break
        }
        timeLens = timeLens + this.playList[i].duration
        this.hasPlayTime = val
      }
      // this.playList.map((item, i) => {
      //   // if (item.position <= val & val < (item.position + item.duration)) {
      //   //   this.hasPlayTime = val
      //   //   if (this.currentIndex != i) { // 显示当前的video
      //   //     this.currentIndex = i
      //   //   }
      //   //   this.currentVideo.currentTime = val - item.position
      //   //   this.currentVideo.play()
      //   // }
      // })
      if (this.audioSrc) {
        this.audioInstance.currentTime = this.hasPlayTime
      }
    },
    triggerPlay () {
      let videoItem = this.playList[0]
      if (videoItem.enoughToPlay) {
        videoItem.canvasInstance.play().catch((e) => {
          console.log(e)
        })
        this.currentVideo.isPlaying = true
      } else {
        videoItem.canvasInstance.load()
      }
    },
    // 全屏
    triggerScreen () {
      let canvas = document.getElementById('myCanvas')
      if (screenfull.enabled) {
        screenfull.toggle(canvas)
        this.isFullscreen = !this.isFullscreen
      } else {
        this.isFullscreen = false
      }
    }
  }
}
</script>
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.play-icon {
  position: absolute;
  top:0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.play-icon i {
  font-size: 30px
}
.video-cont{
  position: relative;
  margin: 0 auto;
  width: 400px;
  height: 200px;
  overflow: hidden;
}
.video-cont:hover .controls{
  display: block;
}
 .controls{
   opacity: 0.8;
    background-color: #fff;
    position: absolute;
    bottom: 0;
    width: 100%;
  }
  .controls .row {
    line-height: 30px;
  }
.time-duration {
  font-size: 0.6rem;
}
.sound-contr{
  position: relative;
  cursor: pointer;
  display: inline-block;
  font-size: 12px;
  color: #999;
  border: 1px solid #999;
  vertical-align: bottom;
}
.sound-contr:hover input[type=range][orient=vertical] {
  display: block;
}
input[type=range][orient=vertical]{
    display: none;
    position: absolute;
    bottom: 30px;
    right: 5px;
    writing-mode: bt-lr; /* IE */
    -webkit-appearance: slider-vertical; /* WebKit */
    width: 8px;
    height:  80px;
    padding: 0 5px;
}
</style>
<style>
.el-loading-mask {
  margin-bottom: 36px !important;
  background-color: #000;
}
</style>
