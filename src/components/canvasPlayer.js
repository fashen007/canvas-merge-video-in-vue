var VideoToCanvas = (function (window, document) {
    function VideoToCanvas (videoElement, canvas, option) {
      if (!videoElement) return
    //   canvas.width = videoElement.offsetWidth;
    //   canvas.height = videoEle/ment.offsetHeight;
      var ctx = canvas ? canvas.getContext('2d') : null;
      var newVideo = videoElement.cloneNode(false);
      var timer = null;
      var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                  window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  
      var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
  
      function drawCanvas() {
        ctx.drawImage(newVideo, 0, 0, canvas.width, canvas.height);
        timer = requestAnimationFrame(drawCanvas);
      }
  
      function stopDrawing() {
        cancelAnimationFrame(timer);
      }
      function pause (e) {
        stopDrawing()
        option['pause'] && option['pause'](e)
      }
      function end (e) {
        stopDrawing()
        option['end'] && option['end'](e)
      }
      function canplay (e) {
        option['canplay'] && option['canplay'](e)
      }
      newVideo.addEventListener('play', function() {
        if (canvas) drawCanvas();
      }, false);
      newVideo.addEventListener('pause', pause, false);
      newVideo.addEventListener('ended', end, false);
      newVideo.addEventListener('canplay', canplay, false);
      newVideo.load()
    //   videoElement.parentNode.replaceChild(canvas, videoElement);
      this.play = function(callback) {
        // newVideo.load()
        newVideo.play()
        callback && callback()
      };
  
      this.pause = function(callback) {
        newVideo.pause();
        callback && callback()
      };
  
      this.playPause = function() {
        if (newVideo.paused) {
          this.play();
        } else {
          this.pause();
        }
      };
  
      this.change = function(src) {
        if (!src) return
        newVideo.src = src;
        newVideo.load() 
      };
  
      this.drawFrame = drawCanvas;
    }
  
    return VideoToCanvas;
  })(window, document);
  export default VideoToCanvas
