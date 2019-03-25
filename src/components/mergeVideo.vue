<template>
  <div style='overflow: hidden; position: relative;'>
    <div class='video-cont'>
      <video class="video" preload='auto' :width="width" :height="height" style='display: none; position:absolute; top: 0;left: 0' v-for="(video, index) in playList" :key='index' :id='`video-${index}`'>
        <source :src="video.src" type='video/mp4' >
      </video>
      <video :width="width" :height="height" :autoplay='autoPlay' id='my-video' playsinline webkit-playsinline style='position:relative; z-index:99' ></video>
      <!-- <canvas controls id="myCanvas" width='400' height='200' style="border:1px solid #d3d3d3;">Your browser does not support the HTML5 canvas tag.</canvas> -->
      <div class='play-icon' :class='isPauseing ?   "is-pausing" : "is-playing"' @click="changeStatus">
        <i class='kz-icon-zanting' v-if='isPlaying && showPlayingIcon'></i>
        <i class='kz-icon-kaishi' v-else></i>
      </div>
      <video-control v-if='showContr' :time='hasPlayTime' :endTime='endTime' @dragProgress='dragProgress' :showSounds='showSounds' style='z-index: 100'></video-control>
    </div>
    <audio :src="audioSrc" preload="auto" style='display: none' id='insertAudio'></audio>
</div>
</template>

<script>
import videoControl from './video-control.vue'
import screenfull from 'screenfull'
import VideoPlayer from './video-player.js'
var drawTimerInterval = null
var progressInterval = null
export default {
  name: 'MergeVideo',
  components: {
    videoControl
  },
  props: {
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
      default: 400
    },
    height: {
      type: Number,
      default: 200
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
    }
  },
  mounted () {
    this.videoDom = document.getElementById('my-video')
    this.progressSetTimeout = null
    this.hasPlayTime = 0
    // this.cv = document.getElementById('myCanvas')
    this.audioSrc && this.audioInit()
    this.imageInterval = null
  },
  data () {
   
    return {
      isFullscreen: false, // 全屏
      hasPlayTime: 0, // 当前播放时长
      // progress: 0, // 进度条
      endTime: 0, // 总长度.这个是需要后端返回的
      // currentTimeLabel: '0:00', // 默认播放时间 用来显示
      // terminalTimeLabel: '', // 终点时间
      currentTime: 0, // 当前时间
      currentIndex: 0, // 默认当前播放碎片指引
      currentEnoughToPlay: false, // 表示是否需要显示enoughToPlay状态
      loading: true, // loading状态
      isPauseing: true, // 暂停状态
      audioPlaying: false, // 音频播放状态
      mutedable: false, // 是否静音
      // videoInstance: null, // 当前激活的视频实例
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
        newVal.map((item) => {
          this.endTime = this.endTime + item.duration
        })
        this.$nextTick(() => {
         this.videoDom.src = newVal[0].src
          this.currentVideoInstance = new VideoPlayer(this.videoDom, null, {
            end: this.videoEndedHandle,
            canplay: this.videoCanplayHandle,
            play: this.videoPlayHandle,
            timeupdate: this.timeupdate
          })
          this.currentVideoInstance.load()
        })
      }
    },
    // currentEnoughToPlay之后 触发一次播放
    currentEnoughToPlay: function (newVal, oldVal) {
      if (newVal && newVal != oldVal) {
        this.triggerPlay()
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
    // currentTimeLabel: function (newVal, oldVal) { // 用来触发声音
    //   if (newVal != oldVal) {
    //     if (this.audioSrc && !this.audioPlaying) {
    //       this.audioInstance.play() // 当拖拽的是 视频应该暂停,不然声音还一直播放
    //     }
    //   }
    // },
    sounds: function (newVal, oldVal) {
      if (this.audioSrc) { // 如果存在插入音频 视频的音量设置为零
        this.audioInstance.volume = newVal / 100
      } else {
        // this.videoInstance.volume = newVal / 100
      }
    }
  },
  methods: {
    // 视频play监听回调
    videoPlayHandle () {
      console.log('开始播放')
      this.isPauseing = false
      this.drawStart()
      // this.audioInstance.play()
    },
    // 视频pause监听回调
    videoPauseHandle () {
      this.isPauseing = true
    },
    // 视频ended监听回调
    videoEndedHandle () {
      if (this.currentIndex < this.playList.length - 1) {
        this.currentIndex ++
        this.$nextTick(() => {
          // this.videoInit()
          let videoBackDom = document.getElementById('video-' + this.currentIndex)
          videoBackDom.style.display = 'block'
          videoBackDom.style.zIndex = '98'
          this.currentVideoInstance.change(this.playList[this.currentIndex].src)
        })
      } else {
        this.isPauseing = true
        this.clearIntervaler()
      }
    },
    // 视频canplay监听回调
    videoCanplayHandle () {
      this.playList[this.currentIndex].enoughToPlay = true
      this.loading = false
      let videoBackDom = document.getElementById('video-' + this.currentIndex)
      videoBackDom.style.display = 'none'
      videoBackDom.style.zIndex = '0'
      if (this.autoPlay || this.currentIndex > 0) this.currentVideoInstance.play()
    },
    // 视频Waiting监听回调
    videoWaitingHandle () {
      this.isPauseing = true
      this.loading = true
      this.currentEnoughToPlay = false
      if (this.audioSrc) {
        this.audioInstance.pause()
      }
    },
    videoInit () {
      console.log('this.videoInstance')
      if (!this.videoInstance) return
      this.videoInstance.src = this.playList[this.currentIndex].src
      // if (this.audioSrc) { // 如果存在插入音频 视频的音量设置为零
        this.videoInstance.muted = true
      //   this.audioInstance.volume = this.sounds / 100
      //   this.mutedable = this.audioInstance.muted
      // } else {
      //   this.videoInstance.volume = this.sounds / 100
      //   this.mutedable = this.videoInstance.muted
      // }
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
    // 播放或者暂停
    changeStatus () {
      this.currentVideoInstance.play()
    },
    drawStart () {
      const that = this
      this.clearIntervaler()
      if (!drawTimerInterval) {
        drawTimerInterval = window.setInterval(() => {
          that.currentTime = that.videoDom.currentTime
        }, 20)  // 每0.02秒画一张图片
      }
    },
    dragProgress (val) {
      if (val == Math.floor(this.hasPlayTime)) return // 表示是自动播放过程
      // 拖拽了
      this.clearIntervaler()
      this.isPauseing = true
      this.currentVideoInstance.pause() // 当拖拽的是 视频应该暂停,不然声音还一直播放
      if (this.audioSrc) {
        this.audioInstance.pause() // 当拖拽的是 视频应该暂停,不然声音还一直播放
      }
      // 拖动进度条
      this.playList.map((item, i) => {
        // 判断当前滑点在哪个视频源上
        if (item.position <= val & val < (item.position + item.duration)) {
          this.hasPlayTime = val
          if (this.currentIndex != i) { // 显示当前的video
            this.currentIndex = i
            this.currentVideoInstance.src = this.playList[this.currentIndex].src
            // this.videoInit() // 初始化video实例
          }
          this.currentVideoInstance.currentTime = val - item.position
        }
      })
      if (this.audioSrc) {
        this.audioInstance.currentTime = this.hasPlayTime
      }
      // this.currentTimeLabel = this.durationFormat(this.hasPlayTime)
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
    },
    videoPreLoad () {
      let preLoadSourceIndex = this.currentIndex + 1
      if (preLoadSourceIndex < this.playList.length) { // 存在就让他去提前加载
        // 没加载过的提前加载
        if (this.playList[preLoadSourceIndex].enoughToPlay) return
        let clonedom = this.videoInstance.cloneNode(true)
        clonedom.src = this.playList[preLoadSourceIndex].src
        clonedom.addEventListener('canplay', () => {
          console.log('preLoadSourceIndex', preLoadSourceIndex)
          this.playList[preLoadSourceIndex].enoughToPlay = true
        }, false)
        clonedom.load()
      }
    },
    clearIntervaler () {
      clearInterval(drawTimerInterval) // 暂停绘画
      clearInterval(progressInterval) // 暂停计时
      drawTimerInterval = null
      progressInterval = null
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
  z-index: 100;
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
