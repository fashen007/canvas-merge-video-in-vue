<template>
<div>
    <div v-if='picOption.editLogo'>
      <canvas controls id="picCanvas" width='400' height='200' style='display: none'>Your browser does not support the HTML5 canvas tag.</canvas>
    </div>
    <el-button @click='mergePic' style='margin-top: 20px' id='printLogo'>打水印</el-button>
    <div class="pic-adjust">
      <h2>图片调整区域</h2>
      <div class="wrap">
          <vue-drr :bounds='{parent:true}' :w='picOption.info.w' :h='picOption.info.h' :rotatable='true' 
          @dragging="handleDragging"
          @resizing="handleResizing"
          @rotating="handleRotating"
          style='position:absolute'>
            <img :src="picOption.logoSrc" alt="" style='width: 100%; height: 100%' id='logo'>
          </vue-drr>
      </div>
    </div>
</div>
</template>

<script>
import VueDRR from 'vue-drr'
export default {
  name: 'water-mark',
  props: {
    picOption: {
      type: Object,
      default: {
        editLogo: true,
        info: {
          r: 0,
          h: 100,
          w: 100,
          x: 0,
          y: 0
        },
        logoSrc: ''
      }
    },
    currentTime: {
      type: Number,
      default: 0
    },
    drawInstance: {
      default: null
    }
  },
  components: {
    'vue-drr': VueDRR
  },
  mounted () {
    if (this.picOption.editLogo) {
      this.picCanvas = document.getElementById('picCanvas')
      this.picContext = this.picCanvas.getContext('2d')
    }
  },
  data () {
    return {
      mergePicToVideo: false // 是否需要打水印
    }
  },
  watch: {
    currentTime: function (newVal, oldVal) {
      if (this.mergePicToVideo && this.picOption.editLogo && this.drawInstance) {
        this.drawInstance.drawImage(this.picCanvas, 0, 0, 400, 200)
      }
    }
  },
  methods: {
    mergePic () {
      this.rotateAndPaintImage()
      this.mergePicToVideo = true
    },
    rotateAndPaintImage () {
      const logo = document.getElementById('logo')
      const drawX = this.picOption.info.r == 0 ? this.picOption.info.x : (Math.round(Math.abs(this.picOption.info.r)) == 180 ? -this.picOption.info.x : 0)
      const drawY = this.picOption.info.r == 0 ? this.picOption.info.y : (Math.round(Math.abs(this.picOption.info.r)) == 180 ? -this.picOption.info.y : 0)
      this.picContext.save()
      this.picContext.clearRect(0, 0, 400, 200)
      if (this.picOption.info.r && Math.round(Math.abs(this.picOption.info.r)) != 180) {
        this.picContext.translate(this.picOption.info.x, this.picOption.info.y)
      } else {
        this.picContext.translate(this.picOption.info.w / 2, this.picOption.info.h / 2)
      }
      this.picContext.rotate(this.picOption.info.r * Math.PI / 180)
      if (!this.picOption.info.r || Math.round(Math.abs(this.picOption.info.r)) == 180) {
        this.picContext.translate(-this.picOption.info.w / 2, -this.picOption.info.h / 2)
      }
      logo && this.picContext.drawImage(logo, drawX, drawY, this.picOption.info.w, this.picOption.info.h)
      this.picContext.restore()
    },
    handleDragging (x, y) {
     Object.assign(this.picOption.info, {x, y})
    },
    handleResizing (x, y, width, height) {
      Object.assign(this.picOption.info, {x, y, w: width, h: height})
    },
    handleRotating (range) {
      this.picOption.info.r = range
    }
  }
}
</script>
