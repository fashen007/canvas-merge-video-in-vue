<template>
 <div class='controls'>
    <el-row :gutter="5" class='row'>
    <!-- <el-col :span="3"><div class="grid-content bg-purple"></div><el-button size="mini" @click.native='clickTrigger'>{{videoPauseing ? '开始': '暂停'}}</el-button></el-col> -->
    <el-col :span="7" class='time-duration'><div class="grid-content bg-purple">{{currentTimeLabel}}/{{terminalTimeLabel}}</div></el-col>
    <el-col :span="8"><div class="grid-content bg-purple"><el-slider :step="0.01" @change='progressDrag' v-model="progress" :max='endTime' :format-tooltip="formatTooltip"></el-slider></div></el-col>
    <el-col :span="6">
      <div class="grid-content bg-purple">
      <span class='sound-contr' v-if='showSounds'> 
          <span class='sound-icon' @click='triggerSound'>{{mutedable ? '声音' : '静音'}}</span>
          <input type="range" name="" v-model="sounds" orient="vertical">
      </span>
      <span class='sound-contr'> 
          <!-- <span class='sound-icon' @click='triggerScreen'>{{isFullscreen ? '取消全屏' : '全屏'}}</span> -->
      </span>
      </div>
    </el-col>
  </el-row>
</div>
</template>

<script>
  import moment from 'moment'
  require('moment-duration-format')
  export default {
    name: 'video-control',
    props: ['time', 'endTime', 'showSounds'],
    data () {
      return {
        currentTimeLabel: '0:00',
        terminalTimeLabel: '',
        progress: 0 // 进度条
      }
    },
    watch: {
      time (val) {
        this.progress = val
        // this.currentTimeLabel = this.durationFormat(Math.floor(val))
      },
      endTime (val) {
        this.terminalTimeLabel = this.durationFormat(val) // 格式化所有视频长度
      },
      progress (val) {
        this.currentTimeLabel = this.durationFormat(Math.floor(val))
      }
    },
    methods: {
    /*
      @param ms 秒数
    */
      durationFormat (ms) {
        // 大过一个小时候的时候 格式化为: h:m:ss
        // 否则不显示小时 只显示 分和秒
        return ms > 3600 ? moment.duration(ms, 'seconds').format('h:m:ss', { trim: false }) : moment.duration(ms, 'seconds').format('m:ss', { trim: false })
      },
      progressDrag (val) {
        this.$emit('dragProgress', val)
      },
      formatTooltip () {
        return this.currentTimeLabel
      },
      triggerSound () {
        this.mutedable = !this.mutedable
        if (this.audioSrc) { // 如果存在插入音频 视频的音量设置为零
          this.audioInstance.muted = this.mutedable
        } else {
          this.videoInstance.muted = this.mutedable
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
