<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <template v-for='(list, i) in playList' v-if='list.load'>
      <video id="video" controls width="270">
        <source :src="list.src" type='video/mp4' key='i'>
      </video>
    </template>
    <div class='video-cont'>
      <canvas controls id="myCanvas" width="270" height="135" style="border:1px solid #d3d3d3;">Your browser does not support the HTML5 canvas tag.</canvas>
      <div class='controls'>
          <el-row :gutter="5" class='row'>
            <el-col :span="3"><div class="grid-content bg-purple"></div><el-button size="mini" @click.native='pause'>{{stop ? '开始': '暂停'}}</el-button></el-col>
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
      stop: true,
      sounds: 10,
      allLength: 72,
      currentTime: '0:00',
      currentIndex: 0,
      lastTime: '',
      instance: null,
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
    const that = this
    that.instance = document.getElementById('video');
    var c = document.getElementById('myCanvas');
    var ctx = c.getContext('2d');
    let drawTimerInterval = null
    let currentTimeInterval = null
    that.lastTime = that.durationFormat(that.allLength)
    if (that.instance) {
       // 播放
      that.instance.addEventListener('play', function() {
          drawTimerInterval = window.setInterval(function() {
              ctx.drawImage(that.instance, 0, 0, 270, 135);
          }, 20);  // 每0.02秒画一张图片
          currentTimeInterval = window.setInterval(function() {
            let tmepTimeHasPlay = 0
            for(let i = 0; i<that.currentIndex; i++) {
              tmepTimeHasPlay = tmepTimeHasPlay + that.playList[that.currentIndex].length
            }
            that.currentTime = that.durationFormat(tmepTimeHasPlay + that.instance.currentTime + 1)
          }, 1000);  // 一秒钟更新一次
      }, false);
      // 暂停
      that.instance.addEventListener('pause', function() {
          window.clearInterval(drawTimerInterval);  // 暂停绘画
          window.clearInterval(currentTimeInterval);  // 暂停计时
      }, false);

      // 结束
      this.instance.addEventListener('ended', function() {
        clearInterval(drawTimerInterval);
        clearInterval(currentTimeInterval);
      }, false)
    }
    // $video1.attr("src", "http://www.w3school.com.cn/example/html5/mov_bbb.mp4");
    // $video2.attr("src", "https://www.w3schools.com/html/movie.mp4");
    // $video3.attr("src", "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4");
  },
  wacth: {
  },
  methods: {
    durationFormat(ms) {
     return ms > 3600000 ? moment.duration(ms, "seconds").format('h:m:ss', { trim: false }) : moment.duration(ms, "seconds").format('m:ss', { trim: false })
    },
    progressChange(val) {
      let tempLenth = 0;
      this.playList.map((item, i) => {
        if (item.position < val & val < (item.position + item.duration)) {
          this.instance.src = item.src
          this.currenTime = val
          this.instance.currentTime = val - 0;
        }
      })
    },
    pause() {
      this.stop = !this.stop
      this.stop ? this.instance.pause() : this.instance.play()
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
