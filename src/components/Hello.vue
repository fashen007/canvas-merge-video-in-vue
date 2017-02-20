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
            <el-col :span="7" class='time-duration'><div class="grid-content bg-purple">{{currentTimeLabel}}/{{terminalTime}}</div></el-col>
            <el-col :span="10"><div class="grid-content bg-purple"><el-slider @change='progressDrag' v-model="progress" :max='allLength'></el-slider></div></el-col>
          </el-row>
      </div>
    </div>
</div>
  </div>
</template>
<script>
import moment from 'moment'
require('moment-duration-format')
export default {
  name: 'hello',
  data () {
    return {
      autoPlay: false, // 是否自动播放
      progressAutoAdd: true, // 表示是否是自己播放的还是拖拽后播放的
      currentEnoughToPlay: false, // 表示是否需要显示enoughToPlay状态
      pauseing: true, // 暂停状态
      playing: false, // 播放状态
      sounds: 10, // 声音控制,暂时还没实现
      progress: 0,
      allLength: 134, // 总长度.这个是需要后端返回的
      currentTimeLabel: '0:00', // 默认播放时间 用来显示
      currentTime: 0,
      currentIndex: 0, // 默认当前播放碎片指引
      terminalTime: '', // 终点
      videoInstance: null, // 当前激活的视频实例
      canvasInstance: null, // canvas 实例
      playList: [{ // 碎片资源列表  这个是需要后端返回的
        src: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
        duration: 52, // 长度
        position: 0, // 节点
        enoughToPlay: false // 是否加载过  但是不一定是加载完成了
      }, {
        src: 'http://www.w3school.com.cn/example/html5/mov_bbb.mp4',
        duration: 10, // 长度
        position: 53, // 节点
        enoughToPlay: false // 是否加载过  但是不一定是加载完成了
      }, {
        src: 'https://www.w3schools.com/html/movie.mp4',
        duration: 12,
        position: 63,
        enoughToPlay: false
      }, {
        src: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
        duration: 60,
        position: 75,
        enoughToPlay: false
      }]
    }
  },
  mounted () {
    this.progressSetTimeout = null
    this.hasPlayTime = 0
    let c = document.getElementById('myCanvas')
    this.canvasInstance = c.getContext('2d')
    this.terminalTime = this.durationFormat((this.allLength)) // 格式化所有视频长度
    this.init()
  },
  watch: {
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
        this.hasPlayTime = this.hasPlayTime + (diff > 0 ? diff : 0)
        this.canvasInstance.drawImage(this.videoInstance, 0, 0, 400, 200)
        that.progressSetTimeout = window.setTimeout(() => {
          that.currentTimeLabel = that.durationFormat(Math.floor(this.hasPlayTime))
        }, 1000)  // 一秒钟更新一次
      }
    }
  },
  methods: {
    init () {
      const that = this
      that.videoInstance = document.querySelectorAll('video')[this.currentIndex]
      this.drawTimerInterval = null
      this.progressInterval && clearInterval(this.progressInterval)
      this.drawTimerInterval && clearInterval(this.drawTimerInterval)
      // 视频play监听回调
      let videoPlayHandle = () => {
        this.playing = true
        this.pauseing = false
        console.log('播放一下呗')
        this.drawTimerInterval = window.setInterval(() => {
          this.currentTime = that.videoInstance.currentTime
        }, 20)  // 每0.02秒画一张图片
        this.progressInterval = window.setInterval(() => {
          that.progress = Math.floor(that.hasPlayTime)
          console.log('我还是执行了')
        }, 1000)  // 每0.02秒画一张图片
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
        }
        // 清除绘制计时器
        clearInterval(this.drawTimerInterval) // 暂停绘画
      }
      // 视频canplay监听回调
      let videoCanplayHandle = () => {
        this.currentEnoughToPlay = true
        this.playList[this.currentIndex].enoughToPlay = true
      }
      // 视频等待缓冲监听回调
      let videoWaitingHandle = () => {
        this.playList[this.currentIndex].enoughToPlay = false
        this.playing = false
        this.pauseing = true
      }
      if (that.videoInstance) {
        // 避免多次绑定,
        that.videoInstance.removeEventListener('play', videoPlayHandle)
        that.videoInstance.removeEventListener('pause', videoPauseHandle)
        that.videoInstance.removeEventListener('ended', videoEndedHandle)
        that.videoInstance.removeEventListener('canplay', videoCanplayHandle)
        that.videoInstance.removeEventListener('waiting', videoWaitingHandle)
        // 播放
        that.videoInstance.addEventListener('play', videoPlayHandle, false)
        // 暂停
        that.videoInstance.addEventListener('pause', videoPauseHandle, false)
        // 结束
        this.videoInstance.addEventListener('ended', videoEndedHandle, false)
        // 可以播放
        this.videoInstance.addEventListener('canplay', videoCanplayHandle, false)
        // 需要缓冲
        this.videoInstance.addEventListener('waiting', videoWaitingHandle, false)
        // 预先加载下一个视频碎片
        this.videoPreLoad()
        this.captureFisrt()
      }
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
      clearInterval(this.progressInterval)
      clearInterval(this.drawTimerInterval)
      this.playing = false
      this.pauseing = true
      this.videoInstance.pause() // 当拖拽的是 视频应该暂停,不然声音还一直播放
      // 拖动进度条
      this.playList.map((item, i) => {
        // 判断当前滑点在哪个视频源上
        let tempLength = 0 // 记录当前滑点之前的视频时间总长度
        if (item.position <= val & val < (item.position + item.duration)) {
          if (this.currentIndex != i) { // 显示当前的video
            this.currentIndex = i
            this.init() // 初始化video实例
          }
          this.hasPlayTime = val
          this.videoInstance.currentTime = val - tempLength
        }
        tempLength = tempLength + item.duration
      })
    },
    clickTrigger () {
      this.autoPlay = true
      this.triggerPlay()
    },
    triggerPlay () {
      clearInterval(this.drawTimerInterval)
      clearInterval(this.progressInterval)
      if (this.playing) {
        this.videoInstance.pause()
      } else {
        this.videoInstance.play()
      }
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
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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
</style>
