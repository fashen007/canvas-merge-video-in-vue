<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <template v-for='(list, i) in playList'>
      <video class="video" controls width="270" v-show='i === currentIndex'>
        <source :src="list.src" type='video/mp4' key='i'>
      </video>
    </template>
    <div class='video-cont'>
      <canvas controls id="myCanvas" width="270" height="135" style="border:1px solid #d3d3d3;" v-loading.body="loading">Your browser does not support the HTML5 canvas tag.</canvas>
      <div class='controls'>
          <el-row :gutter="5" class='row'>
            <el-col :span="3"><div class="grid-content bg-purple"></div><el-button size="mini" @click.native='triggerPlay'>{{pauseing ? '开始': '暂停'}}</el-button></el-col>
            <el-col :span="7" class='time-duration'><div class="grid-content bg-purple">{{currentTime}}/{{lastTime}}</div></el-col>
            <el-col :span="10"><div class="grid-content bg-purple"><el-slider @change='progressChange' v-model="progress" :max='allLength'></el-slider></div></el-col>
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
      let diff = Number(newVal - oldVal).toFixed(2)
      if(diff > 1) { // 表示是拖拽的 不是自然累加的
        console.log('大?')
        this.progressAutoAdd = false
      }
    }
  },
  methods: {
    init() {
      const that = this
      console.log('this.currentIndex', this.currentIndex)
      that.videoInstance = document.querySelectorAll('video')[this.currentIndex];
      let drawTimerInterval = null
      let currentTimeInterval = null
      if (that.videoInstance ) {
         // 播放
        that.videoInstance.addEventListener('play', function() {
            window.clearInterval(currentTimeInterval)
            that.playing = true
            that.pauseing = false
            drawTimerInterval = window.setInterval(() => {
                that.progressAutoAdd = true
                that.canvasInstance.drawImage(that.videoInstance, 0, 0, 270, 135);
            }, 20);  // 每0.02秒画一张图片

            currentTimeInterval = window.setInterval(() => {
              that.progress = that.progress + 1 // 播放条累计
              that.currentTime = that.durationFormat(that.progress)
            }, 1000);  // 一秒钟更新一次

        }, false);
        // 暂停
        that.videoInstance.addEventListener('pause', function() {
            that.playing = false
            that.pauseing = true
            window.clearInterval(drawTimerInterval);  // 暂停绘画
            window.clearInterval(currentTimeInterval);  // 暂停计时
        }, false);
        // 结束
        this.videoInstance.addEventListener('ended', ()=> {
          if (this.currentIndex < this.playList.length) {
            this.currentIndex++
            this.init()
            this.triggerPlay()
          } else {
            this.playing = false
            this.pauseing = true
          }
          window.clearInterval(drawTimerInterval);  // 暂停绘画
          window.clearInterval(currentTimeInterval);  // 暂停计时
        }, false)
        // 可以播放
        this.videoInstance.addEventListener('canplay', () => {
           this.loading = false
           this.playList[this.currentIndex].load = true
        }, false)
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
    progressChange(val) {
      if(this.progressAutoAdd) return
      this.playing = false
      this.pauseing = true
      if (!val) {
        // 当拖到最前的时候 播放第一个
        this.videoInstance.src = this.playList[0].src;
      } else {
        // 拖动进度条
        this.playList.map((item, i) => {
          // 判断当前滑点在哪个视频源上
          let tempLength = 0 // 记录当前滑点之前的视频时间总长度
          if (item.position < val & val < (item.position + item.duration)) {
            this.videoInstance.src = item.src
            this.currentIndex = i
            this.currentTime = this.durationFormat(val)
            this.videoInstance.currentTime = val - tempLength
            this.loading = !item.load
          }
          tempLength = tempLength + item.duration
        })
      }
    },
    triggerPlay() {
      console.log('播放')
      if (!this.videoInstance.paused && !this.pauseing) {
        this.videoInstance.pause();
        console.log('展厅')
      } else if(this.playList[this.currentIndex].load && !this.playing) {
        this.videoInstance.play();
        console.log('kaishi')
      }
      console.log('this.playList[this.currentIndex].load', this.playList[this.currentIndex].load)
      console.log('this.videoInstance.paused ', this.videoInstance.paused)
      console.log('this.playing', this.playing)
      this.pauseing = !this.pauseing
    },
    videoPreLoad(){
      let preLoadSourceIndex =  this.currentIndex + 1
      if(preLoadSourceIndex < this.playList.length) { // 存在就让他去提前加载
        let nextVedio = document.querySelectorAll('video')[this.currentIndex]
        nextVedio.load()
        nextVedio.addEventListener('canplay', () => {
          this.playList[this.currentIndex+1].load = true
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
  width: 270px;
  height: 135px;
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
.sounds-contro {
  position: absoulte;
  bottom: 2px;
  right: 4px;
  height: 50%;
  transform: rotate(-90deg);
  -ms-transform: rotate(-90deg);		/* IE 9 */
  -webkit-transform: rotate(-90deg);	/* Safari and Chrome */
  -o-transform: rotate(-90deg);		/* Opera */
  -moz-transform: rotate(-90deg);		/* Firefox */
}
</style>
