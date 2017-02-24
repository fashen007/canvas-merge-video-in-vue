<template>
  <div class="hello">
    <template v-for='(list, i) in playList'>
      <video class="video" controls width="270" v-show='i == currentIndex' style='position:absolute; left: 9999px;'>
        <source :src="list.src" type='video/mp4' key='i' >
      </video>
    </template>
    <div class='video-cont' v-loading="!currentEnoughToPlay">
      <canvas controls id="myCanvas" width='400'height='200'style="border:1px solid #d3d3d3;">Your browser does not support the HTML5 canvas tag.</canvas>
      <div class='controls'>
          <el-row :gutter="5" class='row'>
            <el-col :span="3"><div class="grid-content bg-purple"></div><el-button size="mini" @click.native='clickTrigger'>{{pauseing ? '开始': '暂停'}}</el-button></el-col>
            <el-col :span="7" class='time-duration'><div class="grid-content bg-purple">{{currentTimeLabel}}/{{terminalTimeLabel}}</div></el-col>
            <el-col :span="10"><div class="grid-content bg-purple"><el-slider @change='progressDrag' v-model="progress" :max='allLength'></el-slider></div></el-col>
            <el-col :span="4">
              <div class="grid-content bg-purple">
                 <span class='sound-contr'> <span class='sound-icon' @click='triggerSound'>{{mutedable ? '声音' : '静音'}}</span><input type="range" name="" v-model="sounds" orient="vertical"></span>
              </div>
            </el-col>
          </el-row>
      </div>
    </div>
</div>
  </div>
</template>
<script>
import moment from 'moment'
require('moment-duration-format')
var drawTimerInterval = null
var progressInterval = null
export default {
  name: 'MergeVideo',
  props: {
    autoPlay: {
      type: Boolean,
      default: false
    },
    playList: {
      type: Array,
      default: []
    }
  },
  mounted () {
    this.progressSetTimeout = null
    this.hasPlayTime = 0
    let c = document.getElementById('myCanvas')
    this.canvasInstance = c.getContext('2d')
  },
  data () {
    return {
      progress: 0, // 进度条
      allLength: 0, // 总长度.这个是需要后端返回的
      currentTimeLabel: '0:00', // 默认播放时间 用来显示
      terminalTimeLabel: '', // 终点时间
      currentTime: 0, // 当前时间
      currentIndex: 0, // 默认当前播放碎片指引
      currentEnoughToPlay: false, // 表示是否需要显示enoughToPlay状态
      pauseing: true, // 暂停状态
      playing: false, // 播放状态
      sounds: 10, // 声音控制
      mutedable: false, // 是否静音
      videoInstance: null, // 当前激活的视频实例
      canvasInstance: null // canvas 实
    }
  },
  watch: {
    playList: function (newVal, oldVal) {
      if (newVal.length && newVal != oldVal) {
        this.playList.map((item) => {
          this.allLength = this.allLength + item.duration
        })
        this.terminalTimeLabel = this.durationFormat((this.allLength)) // 格式化所有视频长度
        this.$nextTick(() => {
          this.init()
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
      if (newVal != oldVal) {
        let diff = newVal - oldVal
        this.hasPlayTime = this.hasPlayTime + (diff > 0 ? (diff > 0.02 ? 0.02 : diff) : 0)
        this.canvasInstance.drawImage(this.videoInstance, 0, 0, 400, 200)
        that.progressSetTimeout = window.setTimeout(() => {
          that.currentTimeLabel = that.durationFormat(Math.floor(this.hasPlayTime))
        }, 1000)  // 一秒钟更新一次
      }
    },
    sounds: function (newVal, oldVal) {
      this.videoInstance.volume = newVal / 100
    }
  },
  methods: {
    init () {
      const that = this
      this.videoInstance = document.querySelectorAll('video')[this.currentIndex]
      if (!this.videoInstance) return
      this.videoInstance.volume = this.sounds / 100
      this.mutedable = this.videoInstance.muted
      // 视频play监听回调
      let videoPlayHandle = () => {
        this.playing = true
        this.pauseing = false
        this.drawStart()
      }
      // 视频pause监听回调
      let videoPauseHandle = () => {
        this.playing = false
        this.pauseing = true
      }
      // 视频ended监听回调
      let videoEndedHandle = () => {
        if (this.currentIndex < this.playList.length - 1) {
          this.currentIndex ++
          this.$nextTick(() => {
            this.init()
            this.triggerPlay()
          })
        } else {
          this.playing = false
          this.pauseing = true
          this.clearIntervaler()
        }
      }
      // 视频canplay监听回调
      let videoCanplayHandle = () => {
        this.currentEnoughToPlay = true
        this.playList[this.currentIndex].enoughToPlay = true
      }
      // 避免多次绑定,
      that.videoInstance.removeEventListener('play', videoPlayHandle)
      that.videoInstance.removeEventListener('pause', videoPauseHandle)
      that.videoInstance.removeEventListener('ended', videoEndedHandle)
      that.videoInstance.removeEventListener('canplay', videoCanplayHandle)
      // 播放
      that.videoInstance.addEventListener('play', videoPlayHandle, false)
      // 暂停
      that.videoInstance.addEventListener('pause', videoPauseHandle, false)
      // 结束
      this.videoInstance.addEventListener('ended', videoEndedHandle, false)
      // 可以播放
      this.videoInstance.addEventListener('canplay', videoCanplayHandle, false)
      // 预先加载下一个视频碎片
      this.videoPreLoad()
      this.captureFisrt()
    },
    captureFisrt () {
      const that = this
      that.videoInstance.addEventListener('loadeddata', function callback () {
        if (that.videoInstance.readyState >= 2) {
          that.canvasInstance.drawImage(that.videoInstance, 0, 0, 400, 200)
          that.videoInstance.removeEventListener('loadeddata', callback)
        }
      })
    },
    drawStart () {
      const that = this
      this.clearIntervaler()
      if (!drawTimerInterval && this.playing) {
        drawTimerInterval = window.setInterval(() => {
          this.currentTime = that.videoInstance.currentTime
        }, 20)  // 每0.02秒画一张图片
      }
      if (!progressInterval && this.playing) {
        progressInterval = window.setInterval(() => {
          that.progress = Math.floor(that.hasPlayTime)
        }, 1000)  // 每1秒画统计一次时间条
      }
    },
    /*
      @param ms 秒数
    */
    durationFormat (ms) {
      // 大过一个小时候的时候 格式化为: h:m:ss
      // 否则不显示小时 只显示 分和秒
      return ms > 3600 ? moment.duration(ms, 'seconds').format('h:m:ss', { trim: false }) : moment.duration(ms, 'seconds').format('m:ss', { trim: false })
    },
    progressDrag (val) {
      if (val == Math.floor(this.hasPlayTime)) return // 表示是自动播放过程
      // 拖拽了
      this.clearIntervaler()
      this.pauseing = true
      this.playing = false
      this.videoInstance.pause() // 当拖拽的是 视频应该暂停,不然声音还一直播放
      // 拖动进度条
      this.playList.map((item, i) => {
        // 判断当前滑点在哪个视频源上
        if (item.position <= val & val < (item.position + item.duration)) {
          this.hasPlayTime = val
          if (this.currentIndex != i) { // 显示当前的video
            this.currentIndex = i
            this.init() // 初始化video实例
          }
          this.videoInstance.currentTime = val - item.position
          this.triggerPlay()
        }
      })
      this.currentTimeLabel = this.durationFormat(this.hasPlayTime)
    },
    clickTrigger () {
      this.autoPlay = true
      this.triggerPlay()
    },
    triggerPlay () {
      this.clearIntervaler()
      if (!this.autoPlay) return
      if (!this.playing && this.pauseing) {
        this.videoInstance.play()
      } else {
        this.videoInstance.pause()
      }
    },
    triggerSound () {
      this.mutedable = !this.mutedable
      this.videoInstance.muted = this.mutedable
    },
    videoPreLoad () {
      let preLoadSourceIndex = this.currentIndex + 1
      if (preLoadSourceIndex < this.playList.length) { // 存在就让他去提前加载
        let nextVedio = document.querySelectorAll('video')[preLoadSourceIndex]
        if (nextVedio && !this.playList[preLoadSourceIndex].enoughToPlay) {
          nextVedio.load()
        }
        nextVedio && nextVedio.addEventListener('canplay', () => {
          this.playList[preLoadSourceIndex].enoughToPlay = true
        }, false)
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
