<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <video id="video" controls width="270" autoplay>
      <source src="" type='video/mp4'>
      <source src="http://www.w3school.com.cn/example/html5/mov_bbb.ogg" type='video/ogg'>
      <source src="http://www.w3school.com.cn/example/html5/mov_bbb.webm" type='video/webm'>
    </video>
    <canvas controls id="myCanvas" width="270" height="135" style="border:1px solid #d3d3d3;">Your browser does not support the HTML5 canvas tag.</canvas>
</div>
  </div>
</template>
<script>
import RecordRTC from 'recordrtc'
export default {
  name: 'hello',
  data () {
    return {
      msg: '视屏合并demo',
      playList: ['http://www.w3school.com.cn/example/html5/mov_bbb.mp4', 'http://bbs.xiaomi.cn/t-12455708', 'http://bbs.xiaomi.cn/t-11546960', 'http://bbs.xiaomi.cn/t-11543997', 'http://bbs.xiaomi.cn/t-11542643', 'http://bbs.xiaomi.cn/t-12648405']
    }
  },
  mounted() {
    const that = this
    var recordRTC = RecordRTC(that.playList, {
      type: 'video',
      mimeType: 'video/webm', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
      previewStream: function(stream) {
        console.log(1111)
        // it is optional
        // it allows you preview the recording video
      }
    });
    recordRTC.startRecording();
    recordRTC.stopRecording(function(singleWebM) {
        video.src = singleWebM;

        var recordedBlob = recordRTC.getBlob();
        recordRTC.getDataURL(function(dataURL) {
          console.log('dataURL', dataURL)
        });
    });
    // 视屏地址
    // const that = this
    // ffmpeg(that.playList[0]).input(that.playList[1])
    // .input(that.playList[2])
    // .on('error', function(err) {
    //   console.log('An error occurred: ' + err.message);
    // })
    // .on('end', function() {
    //   console.log('Merging finished !');
    // })
    // .mergeToFile('merge.mp4', '/tmp/');
    // var canvas = document.getElementById('myCanvas');
    // var ctx = canvas.getContext('2d');
    // var video = document.getElementById('video');
    //
    // // set canvas size = video size when known
    // video.addEventListener('loadedmetadata', function() {
    //   canvas.width = video.videoWidth;
    //   canvas.height = video.videoHeight;
    // });
    // video.addEventListener('play', function() {
    //   var $this = this; //cache
    //   (function loop() {
    //     if (!$this.paused && !$this.ended) {
    //       ctx.drawImage($this, 0, 0);
    //       setTimeout(loop, 1000 / 30); // drawing at 30fps
    //     }
    //   })();
    // }, 0);
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
</style>
