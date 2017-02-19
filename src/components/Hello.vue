<template>
  <div class="hello">
    <template v-for='(list, i) in playList'>
      <video class="video" controls width="270" v-show='i == currentIndex' style='position:absolute; left: 9999px;'>
        <source :src="list.src" type='video/mp4' key='i' >
      </video>
    </template>
    <div class='video-cont' v-loading="loading">
      <canvas controls id="myCanvas" width='400'height='200'style="border:1px solid #d3d3d3;">Your browser does not support the HTML5 canvas tag.</canvas>
      <div class='controls'>
          <el-row :gutter="5" class='row'>
            <el-col :span="3"><div class="grid-content bg-purple"></div><el-button size="mini" @click.native='triggerPlay'>{{pauseing ? '开始': '暂停'}}</el-button></el-col>
            <el-col :span="7" class='time-duration'><div class="grid-content bg-purple">{{currentTime}}/{{lastTime}}</div></el-col>
            <el-col :span="10"><div class="grid-content bg-purple"><el-slider @change='progressDrag' v-model="progress" :max='allLength'></el-slider></div></el-col>
          </el-row>
      </div>
    </div>
</div>
  </div>
</template>
<script>
import moment from 'moment'
require("moment-duration-format")
export default {
  name: 'hello',
  data () {
    return {
      msg: '视屏合并demo',
      progress: 0,
      progressAutoAdd: true,
      loading: true,
      pauseing: true,
      playing: false,
      sounds: 10,
      allLength: 82,
      currentTime: '0:00',
      currentIndex: 0,
      lastTime: '',
      videoInstance: null,
      canvasInstance: null,
      playList: [{
        src: 'http://www.w3school.com.cn/example/html5/mov_bbb.mp4',
        duration: 10,
        position: 1,
        load: true
      }, {
        src: 'https://www.w3schools.com/html/movie.mp4',
        duration: 12,
        position: 11,
        load: false
      }, {
        src: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
        duration: 60,
        position: 23,
        load: false
      }]
    }
  },
  mounted() {
    let c = document.getElementById('myCanvas')
    this.canvasInstance = c.getContext('2d')
    this.lastTime = this.durationFormat(this.allLength)
    this.init()
    // $video1.attr("src", "http://www.w3sch)ool.com.cn/example/html5/mov_bbb.mp4");
    // $video2.attr("src", "https://www.w3schools.com/html/movie.mp4");
    // $video3.attr("src", "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4");
  },
  watch: {
    progress: function(newVal, oldVal) {
      let diff = Number(Math.abs(newVal - oldVal)).toFixed(2)
      if(diff > 1) { // 表示是拖拽的 不是自然累加的
        console.log('应该显')
        this.progressAutoAdd = false
        console.log('this.progressAutoAdd', this.progressAutoAdd)
      }
    },
    loading: function(newVal, oldVal) {
      if (!newVal && newVal != oldVal) {
        this.triggerPlay()
      }
    }
  },
  methods: {
    init() {
      const that = this
      that.videoInstance = document.querySelectorAll('video')[this.currentIndex];
      this.drawTimerInterval = null
      this.currentTimeInterval = null
      let videoPlay = () => {
        window.clearInterval(this.currentTimeInterval)
        this.playing = true
        this.pauseing = false
        console.log('this.drawTimerInterval', this.drawTimerInterval)
        this.drawTimerInterval = window.setInterval(() => {
            that.canvasInstance.drawImage(that.videoInstance, 0, 0, 400, 200);
        }, 20);  // 每0.02秒画一张图片
        this.currentTimeInterval = window.setInterval(() => {
          // console.log(this.videoInstance.buffered)
          that.progressAutoAdd = true
          that.progress = that.progress + 1 // 播放条累计
          that.currentTime = that.durationFormat(that.progress)
        }, 1000);  // 一秒钟更新一次
      }
      let videoPause = () => {
          this.playing = false
          this.pauseing = true
          clearInterval(this.drawTimerInterval);  // 暂停绘画
          clearInterval(this.currentTimeInterval);  // 暂停计时
      }
      let videoEnded = () => {
        if (this.currentIndex < this.playList.length-1) {
          this.currentIndex++
          this.$nextTick(()=> {
            this.init()
            this.triggerPlay()
          })
        } else {
          this.playing = false
          this.pauseing = true
        }
        clearInterval(this.drawTimerInterval);  // 暂停绘画
        clearInterval(this.currentTimeInterval);  // 暂停计时
      }
      let videoCanplay = () => {
         this.loading = false
         this.playList[this.currentIndex].load = true
      }
      if (that.videoInstance ) {
        // 避免多次绑定,
        that.videoInstance.removeEventListener('play', videoPlay)
        that.videoInstance.removeEventListener('pause', videoPause)
        that.videoInstance.removeEventListener('ended', videoEnded)
        that.videoInstance.removeEventListener('canplay', videoCanplay)

        // 播放
        that.videoInstance.addEventListener('play', videoPlay, false);
        // 暂停
        that.videoInstance.addEventListener('pause', videoPause, false);
        // 结束
        this.videoInstance.addEventListener('ended', videoEnded, false)
        // 可以播放
        this.videoInstance.addEventListener('canplay', videoCanplay, false)
        this.videoInstance.addEventListener('waiting', () => {
          console.log('粗发waiting')
           this.loading = true
           clearInterval(this.currentTimeInterval)
        }, false)
        // 预先加载下一个视频碎片
        this.videoPreLoad()
      }
    },
    initDraw() {
      this.canvasInstance.drawImage(this.videoInstance, 0, 0, 270, 135)
    },
    /*
      @param ms 秒数
    */
    durationFormat(ms) {
      // 大过一个小时候的时候 格式化为: h:m:ss
      // 否则不显示小时 只显示 分和秒
     return ms > 3600 ? moment.duration(ms, "seconds").format('h:m:ss', { trim: false }) : moment.duration(ms, "seconds").format('m:ss', { trim: false })
    },
    progressDrag(val) {
      if(this.progressAutoAdd) return
      this.playing = false
      this.pauseing = true
      this.videoInstance.pause() // 当拖拽的是 视频应该暂停,不然声音还一直播放
      clearInterval(this.currentTimeInterval)
      clearInterval(this.drawTimerInterval)
      if (!val) {
        // 当拖到最前的时候 播放第一个
        this.videoInstance.src = this.playList[0].src;
      } else {
        // 拖动进度条
        this.playList.map((item, i) => {
          // 判断当前滑点在哪个视频源上
          let tempLength = 0 // 记录当前滑点之前的视频时间总长度
          if (item.position < val & val < (item.position + item.duration)) {
            this.currentIndex = i // 显示当前的video
            this.init() // 初始化video实例
            this.currentTime = this.durationFormat(val)
            this.videoInstance.currentTime = val - tempLength
            this.loading = !item.load
            if (item.load) {
              this.triggerPlay()
            }
          }
          tempLength = tempLength + item.duration
        })
      }
    },
    triggerPlay() {
      clearInterval(this.currentTimeInterval)
      clearInterval(this.drawTimerInterval)
      if (!this.videoInstance.paused && !this.pauseing) {
        console.log('暂停')
        this.videoInstance.pause()
        this.pauseing = true
      } else if(this.playList[this.currentIndex].load && !this.playing) {
        console.log('开始播放')
        this.videoInstance.play()
        this.pauseing = false
      }
    },
    videoPreLoad(){
      let preLoadSourceIndex =  this.currentIndex + 1
      if(preLoadSourceIndex < this.playList.length) { // 存在就让他去提前加载
        let nextVedio = document.querySelectorAll('video')[preLoadSourceIndex]
        if (nextVedio && !this.playList[preLoadSourceIndex].load) {
          nextVedio.load()
        }
        nextVedio &&　nextVedio.addEventListener('canplay', () => {
          this.playList[preLoadSourceIndex].load = true
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
