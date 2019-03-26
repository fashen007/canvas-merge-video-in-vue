<template>
  <div style='overflow: hidden; position: relative;' @mouseenter='handleMouseenter' @mouseleave='handleMouseleave' v-loading="loading">
    <video class="video" width="270" :src="video.src"  controls :poster="poster" v-for="(video, index) in playList" :key='index' :id='`originVideo-${index}`' playsinline webkit-playsinline>
    </video>
    <div class='video-cont'>
      <!-- <video class="video" :width="width" id='my-video' style="display: none" playsinline webkit-playsinline>
        <source :src="playList[0] ? playList[0].src : ''" type='video/mp4'>
      </video> -->
      <canvas id="myCanvas" :width='canvasWidth' :height='canvasHeight'>Your browser does not support the HTML5 canvas tag.</canvas>
      <div class='play-icon' :class='isPlaying ? "is-playing" : "is-pausing"' @click="changeStatus">
        <template v-if='showPlayingIcon'> 
          <i class='kz-icon-zanting' v-if='isPlaying'></i>
          <i class='kz-icon-kaishi' v-else></i>
        </template>
      </div>
    </div>
    <div class='video-ctrl'> 
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
import { setTimeout } from 'timers';
var drawTimerInterval = null
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || 
window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
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
    document.addEventListener('keydown', (e) => {
      const event = e || window.event
      let code = event.keyCode
      if (event.charCode && code === 0) code = event.charCode
      if (code === 32) {
        this.changeStatus()
      }
    })
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
      showPlayingIcon: true, // 是否展示播放按钮
      isDragging: false, // 拖拽状态
      isPlaying: false, // 播放状态
      canvasWidth: 400, // canvas宽度
      canvasHeight: 200 // canvas高度
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
    currentTime: function (newVal, oldVal) {
      if ((newVal != oldVal) && !this.videoPauseing) {
        let diff = newVal - oldVal
        this.hasPlayTime = this.hasPlayTime + (diff > 0 ? diff : 0)
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
              seeked:  (e) => this.videoSeekedHandle(e, index),
              timeupdate:  (e) => this.timeupdate(e, index)
            })
            this.currentIndex = 0
           })
          this.triggerPlay()
        })
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
      if (this.currentIndex === 0) {
        this.hasPlayTime = 0
      }
      this.isPauseing = false
      this.isPlaying = true
      // this.drawStart()
      this.audioSrc && this.audioInstance.play()
    },
    // 视频pause监听回调
    videoPauseHandle (e, index) {
      this.isPauseing = true
      this.isPlaying = false
    },
    videoSeekedHandle (e, index) {
    },
    timeupdate (e) {
      let currentTime = e.target.currentTime
      this.currentTime = currentTime
    },
    // 视频ended监听回调
    videoEndedHandle (e, index) {
      if (this.isDragging) return
      let videoItem = this.playList[index]
      videoItem.canvasInstance.isPlaying = false
      if (index < this.playList.length - 1) {
        this.currentIndex ++
        this.currentVideo.play()
      } else {
        this.isPauseing = true
        this.isPlaying = false
        this.currentIndex = 0
        this.clearIntervaler()
      }
    },
    // 视频canplay监听回调
    videoCanplayHandle (e, index) {
      this.$nextTick(() => {
        let videoDom = this.currentVideo.videoDom
        if (videoDom.videoHeight > videoDom.videoWidth) {
          this.canvasWidth = this.canvasHeight * videoDom.videoWidth / videoDom.videoHeight
        } else {
          this.canvasHeight = this.canvasWidth * videoDom.videoHeight / videoDom.videoWidth
        }
      })
      if (this.isDragging) {
        this.currentVideo.drawOneTime()
        return 
      }
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
      
    },
    // 播放或者暂停
    changeStatus () {
      if (!this.isPlaying) {
        this.isDragging = false
        // 表示播放第一个
        this.currentVideo.play()
      } else {
        this.currentVideo.pause()
      }
      this.clearIntervaler()
      this.showPlayingIcon = true
    },
    // 鼠标进入屏幕显示当前播放器的状态
    handleMouseenter () {
      if (this.outEventTimer) {
        clearTimeout(this.outEventTimer)
        this.outEventTimer = null
      }
      this.showPlayingIcon = true
    },
    // 鼠标移除屏幕
    handleMouseleave () {
      this.outEventTimer = setTimeout(() => {
        if (!this.outEventTimer) return
        this.showPlayingIcon = false
      }, 400);
    },
    drawStart () {
      const that = this
      this.clearIntervaler()
      function interVal() {
        that.currentTime = that.currentVideo.videoDom.currentTime
        drawTimerInterval = requestAnimationFrame(interVal);
      }
      interVal()
    },
    dragProgress (val) {
      this.isDragging = true
      this.isPauseing = true
      this.currentVideo.currentTime = 0 // 当拖拽的是 视频应该暂停,不然声音还一直播放
      this.currentVideo.pause() // 当拖拽的是 视频应该暂停,不然声音还一直播放
      this.clearIntervaler()
      if (this.audioSrc) {
        this.audioInstance.currentTime = 0
        this.audioInstance.pause() // 当拖拽的是 视频应该暂停,不然声音还一直播放
      }
      // 拖动进度条
      let timeLens = 0
      this.hasPlayTime = val
      console.log('val', val)
      for (let i = 0; i < this.playList.length; i++) {
        // 判断当前滑点在哪个视频源上
        console.log('this.playList[i].canvasInstance.videoDom.duration', this.playList[i].canvasInstance.videoDom.duration)
      }
      for (let i = 0; i < this.playList.length; i++) {
         // 判断当前滑点在哪个视频源上
        console.log('timeLens', timeLens)
        timeLens = timeLens + this.playList[i].canvasInstance.videoDom.duration
        if (timeLens >= val) {
          this.currentIndex = i
          let diff = timeLens - val
          // = timeLens - val
          this.$nextTick(() => {
            // let trueDiff = this.currentVideo.videoDom.duration - diff
            // console.log('trueDiff', trueDiff)
            this.currentVideo.videoDom.currentTime = diff
            this.currentVideo.currentTime = diff
          })
          break
        }
      }
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
    clearIntervaler () {
      cancelAnimationFrame(drawTimerInterval)
      drawTimerInterval = null
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
  background: black;
}
.video-ctrl {
  position: relative;
  margin: 0 auto;
  width: 400px;
  height: 40px;
  background: black;
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
