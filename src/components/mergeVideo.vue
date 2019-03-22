<template>
  <div style='overflow: hidden; position: relative;'>
    <video class="video" preload='auto' width="270" style='display: none' v-for="(video, index) in playList" :key='index'>
      <source :src="video.src" type='video/mp4'>
    </video>
    <div class='video-cont' v-loading="loading">
      <video class="video" :width="width" id='my-video' style="display: none" playsinline webkit-playsinline>
        <source :src="playList[0] ? playList[0].src : ''" type='video/mp4'>
      </video>
      <canvas controls id="myCanvas" width='400' height='200' style="border:1px solid #d3d3d3;">Your browser does not support the HTML5 canvas tag.</canvas>
      <div class='play-icon' :class='isPauseing ?   "is-pausing" : "is-playing"' @click="changeStatus">
        <i class='kz-icon-zanting' v-if='isPlaying && showPlayingIcon'></i>
        <i class='kz-icon-kaishi' v-else></i>
      </div>
      <video-control v-if='showContr' :time='hasPlayTime' :endTime='endTime' @dragProgress='dragProgress' :showSounds='showSounds'></video-control>
    </div>
    <!-- <water-mark v-if='picOption.editLogo' :picOption='picOption' :currentTime='currentTime' :drawInstance='canvasInstance'> </water-mark> -->
    <audio :src="audioSrc" preload="auto" style='display: none' id='insertAudio'></audio>
</div>
</template>

<script>
import videoControl from './video-control.vue'
import waterMark from './water-mark.vue'
import screenfull from 'screenfull'
import VideoToCanvas from './canvasPlayer.js'
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
    }
  },
  mounted () {
    this.videoInstance = document.getElementById('my-video')
    this.progressSetTimeout = null
    this.hasPlayTime = 0
    // this.cv = document.getElementById('myCanvas')
    // this.canvasInstance = this.cv.getContext('2d')
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
      videoInstance: null, // 当前激活的视频实例
      // canvasInstance: null, // canvas 实例
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
        this.playList.map((item) => {
          this.endTime = this.endTime + item.duration
        })
        // this.terminalTimeLabel = this.durationFormat((this.endTime)) // 格式化所有视频长度
        this.$nextTick(() => {
          // console.log('执行了？')
          this.videoInit()
          this.canvasNew = new VideoToCanvas(this.videoInstance, this.cv, {
            end: this.videoEndedHandle,
            canplay: this.videoCanplayHandle
          })
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
        // this.canvasInstance.drawImage(this.videoInstance, 0, 0, 400, 200)
        // if (this.mergePicToVideo && this.picOption.editLogo) {
        //   this.canvasInstance.drawImage(this.picCanvas, 0, 0, 400, 200)
        // }
        that.progressSetTimeout = window.setTimeout(() => {
          // that.currentTimeLabel = that.durationFormat(Math.floor(this.hasPlayTime))
        }, 1000)  // 一秒钟更新一次
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
        this.videoInstance.volume = newVal / 100
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
          console.log('this.playList[this.currentIndex].src', this.playList[this.currentIndex].src)
          this.canvasNew.change(this.playList[this.currentIndex].src)
          // this.videoInstance.src = this.playList[this.currentIndex].src
          // this.triggerPlay()
          // this.videoPreLoad()
        })
      } else {
        this.isPauseing = true
        this.clearIntervaler()
      }
    },
    // 视频canplay监听回调
    videoCanplayHandle () {
      console.log('能够播放了', this.currentIndex)
      this.playList[this.currentIndex].enoughToPlay = true
      this.loading = false
      // if (this.autoPlay) this.triggerPlay()
      if (this.autoPlay || this.currentIndex > 0) this.canvasNew.play()
    },
    // 视频Waiting监听回调
    videoWaitingHandle () {
      console.log('videoWaitingHandle')
      this.isPauseing = true
      this.loading = true
      this.currentEnoughToPlay = false
      if (this.audioSrc) {
        this.audioInstance.pause()
      }
    },
    removeListener () {
      this.videoInstance.removeEventListener('play', this.videoPlayHandle)
      this.videoInstance.removeEventListener('pause', this.videoPauseHandle)
      this.videoInstance.removeEventListener('ended', this.videoEndedHandle)
      this.videoInstance.removeEventListener('canplay', this.videoCanplayHandle)
      this.videoInstance.removeEventListener('waiting', this.videoWaitingHandle)
    },
    videoInit () {
      const that = this
      // this.videoInstance = document.getElementById('my-video')
      console.log('this.videoInstance')
      if (!this.videoInstance) return
      this.videoInstance.src = this.playList[this.currentIndex].src
      if (this.audioSrc) { // 如果存在插入音频 视频的音量设置为零
        this.videoInstance.muted = true
        this.audioInstance.volume = this.sounds / 100
        this.mutedable = this.audioInstance.muted
      } else {
        this.videoInstance.volume = this.sounds / 100
        this.mutedable = this.videoInstance.muted
      }
      // 避免多次绑定,
      this.removeListener()
      // 播放
      that.videoInstance.addEventListener('play', this.videoPlayHandle, false)
      // 暂停
      that.videoInstance.addEventListener('pause', this.videoPauseHandle, false)
      // 结束
      this.videoInstance.addEventListener('ended', this.videoEndedHandle, false)
      // 可以播放
      this.videoInstance.addEventListener('canplay', this.videoCanplayHandle, false)
      // waiting了
      this.videoInstance.addEventListener('waiting', this.videoWaitingHandle, false)
      // 预先加载下一个视频碎片
      this.videoPreLoad()
      this.captureFisrt()
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
      const that = this
      console.log('获取第一帧')
      that.videoInstance.addEventListener('loadeddata', function callback () {
        if (that.videoInstance.readyState >= 2) {
          // that.canvasInstance.drawImage(that.videoInstance, 0, 0, 400, 200)
          console.log(' that.canvasNew', that.canvasNew)
          that.canvasNew.drawFrame()
          that.videoInstance.removeEventListener('loadeddata', callback)
        }
      })
    },
    // 播放或者暂停
    changeStatus () {
      // this.isPlaying = !this.isPlaying
      // this.showPlayingIcon = true
      // if (!this.isPlaying) {
      //   this.isPauseing = true
      //   if (this.audioSrc) {
      //     this.audioInstance.pause()
      //   }
      //   this.videoInstance.pause()
      // }
      // this.triggerPlay()
      this.canvasNew.play()
    },
    drawStart () {
      const that = this
      this.clearIntervaler()
      if (!drawTimerInterval) {
        drawTimerInterval = window.setInterval(() => {
          this.currentTime = that.videoInstance.currentTime
        }, 20)  // 每0.02秒画一张图片
      }
      if (!progressInterval) {
        progressInterval = window.setInterval(() => {
          that.progress = Math.floor(that.hasPlayTime)
        }, 1000)  // 每1秒画统计一次时间条
      }
    },
    // /*
    //   @param ms 秒数
    // */
    // durationFormat (ms) {
    //   // 大过一个小时候的时候 格式化为: h:m:ss
    //   // 否则不显示小时 只显示 分和秒
    //   return ms > 3600 ? moment.duration(ms, 'seconds').format('h:m:ss', { trim: false }) : moment.duration(ms, 'seconds').format('m:ss', { trim: false })
    // },
    dragProgress (val) {
      if (val == Math.floor(this.hasPlayTime)) return // 表示是自动播放过程
      // 拖拽了
      this.clearIntervaler()
      this.isPauseing = true
      this.videoInstance.pause() // 当拖拽的是 视频应该暂停,不然声音还一直播放
      if (this.audioSrc) {
        this.audioInstance.pause() // 当拖拽的是 视频应该暂停,不然声音还一直播放
      }
      // 拖动进度条
      this.playList.map((item, i) => {
        // 判断当前滑点在哪个视频源上
        if (item.position <= val & val < (item.position + item.duration)) {
          this.hasPlayTime = val
          if (this.currentIndex != i) { // 显示当前的video
            // this.removeListener()
            this.currentIndex = i
            this.videoInstance.src = this.playList[this.currentIndex].src
            // this.videoInit() // 初始化video实例
          }
          this.videoInstance.currentTime = val - item.position
          this.triggerPlay()
        }
      })
      if (this.audioSrc) {
        this.audioInstance.currentTime = this.hasPlayTime
      }
      // this.currentTimeLabel = this.durationFormat(this.hasPlayTime)
    },
    triggerPlay () {
      this.clearIntervaler()
      console.log('this.playList[this.currentIndex].enoughToPlay', this.playList[this.currentIndex].enoughToPlay)
      console.log('this.currentIndex', this.currentIndex)
      if (this.playList[this.currentIndex].enoughToPlay) {
        this.videoInstance.play().catch((e) => {
          console.log(e)
        })
      } else {
        this.videoInstance.load()
      }
      // if (this.videoInstance.readyState == 4) {
      //   this.videoInstance.play()
      // } else {
      //   this.loading = true
      //   this.videoInstance.load()
      // }
      // this.videoInstance.pause()
      // this.videoInstance.play()
      // console.log('sss')
      // window.requestAnimationFrame(() => {
      //   if (this.videoInstance.readyState == 4) {
      //     this.videoInstance.play()
      //   } else {
      //     this.loading = true
      //     this.videoInstance.load()
      //   }
      // })
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
    // mergePic () {
    //   this.rotateAndPaintImage()
    //   this.mergePicToVideo = true
    // },
    // rotateAndPaintImage () {
    //   const logo = document.getElementById('logo')
    //   console.log('this.picOption.info', this.picOption.info)
    //   const drawX = this.picOption.info.r == 0 ? this.picOption.info.x : (Math.round(Math.abs(this.picOption.info.r)) == 180 ? -this.picOption.info.x : 0)
    //   const drawY = this.picOption.info.r == 0 ? this.picOption.info.y : (Math.round(Math.abs(this.picOption.info.r)) == 180 ? -this.picOption.info.y : 0)
    //   this.picContext.save()
    //   this.picContext.clearRect(0, 0, 400, 200)
    //   if (this.picOption.info.r && Math.round(Math.abs(this.picOption.info.r)) != 180) {
    //     this.picContext.translate(this.picOption.info.x, this.picOption.info.y)
    //   } else {
    //     this.picContext.translate(this.picOption.info.w / 2, this.picOption.info.h / 2)
    //   }
    //   this.picContext.rotate(this.picOption.info.r * Math.PI / 180)
    //   if (!this.picOption.info.r || Math.round(Math.abs(this.picOption.info.r)) == 180) {
    //     this.picContext.translate(-this.picOption.info.w / 2, -this.picOption.info.h / 2)
    //   }
    //   logo && this.picContext.drawImage(logo, drawX, drawY, this.picOption.info.w, this.picOption.info.h)
    //   this.picContext.restore()
    // },
    // showchange (data) {
    //   this.picOption.info = data
    // }
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
