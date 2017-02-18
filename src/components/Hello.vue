<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <template v-for='(list, i) in playList' v-if='list.load'>
      <video id="video" controls width="270" autoplay>
        <source :src="list.src" type='video/mp4' key='i'>
      </video>
    </template>
    <div class='video-cont'>
      <canvas controls id="myCanvas" width="270" height="135" style="border:1px solid #d3d3d3;">Your browser does not support the HTML5 canvas tag.</canvas>
      <div class='controls'>
        设置
      </div>
    </div>
   
</div>
  </div>
</template>
<script>
export default {
  name: 'hello',
  data () {
    return {
      msg: '视屏合并demo',
      allLength: 72,
      playList: [{
        src: 'http://www.w3school.com.cn/example/html5/mov_bbb.mp4',
        duration: 10,
        load: true
      }, {
        src: 'https://www.w3schools.com/html/movie.mp4',
        duration: 12,
        load: false 
      }, {
        src: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
        duration: 60,
        load: false
      }]
    }
  },
  mounted() {
    const that = this
    var v = document.getElementById('video');
    var c = document.getElementById('myCanvas');
    var ctx = c.getContext('2d');
    let timer = null
    console.log(v)
    if (v) {
       // 播放
      v.addEventListener('play', function() {
          timer = window.setInterval(function() {
              ctx.drawImage(v, 0, 0, 270, 135);
          }, 20);  // 每0.02秒画一张图片
      }, false);

      // 暂停
      v.addEventListener('pause', function() {
          window.clearInterval(timer);  // 暂停绘画
      }, false);

      // 结束
      v.addEventListener('ended', function() {
        clearInterval(timer);
      }, false)
    }
    // $video1.attr("src", "http://www.w3school.com.cn/example/html5/mov_bbb.mp4");
    // $video2.attr("src", "https://www.w3schools.com/html/movie.mp4");
    // $video3.attr("src", "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4");
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
  width: 270px;
  height: 135px;
}
</style>
