var videoPlayer = (function (window, document) {
  function videoPlayer (videoElement, canvas, option) {
    if (!videoElement) return
    let self = this
    self.ctx = canvas ? canvas.getContext('2d') : null;
    var newVideo = canvas ? videoElement.cloneNode(false) : videoElement;
    var timer = null;
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
    self.videoDom = newVideo
    function drawCanvas() {
      self.ctx.drawImage(newVideo, 0, 0, canvas.width, canvas.height);
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
    function play (e) {
      option['play'] && option['play'](e)
    }
    function loadedmetadata (e) {
      option['loadedmetadata'] && option['loadedmetadata'](e)
    }
    newVideo.addEventListener('play', function() {
      if (canvas) drawCanvas();
    }, false);
    newVideo.addEventListener('pause', pause, false);
    newVideo.addEventListener('ended', end, false);
    newVideo.addEventListener('canplay', canplay, false);
    newVideo.addEventListener('play', play, false);
    newVideo.addEventListener('loadedmetadata', loadedmetadata, false);
    // newVideo.addEventListener('loadeddata', function callback () {
    //   newVideo.removeEventListener('loadeddata', callback)
    // })
    // newVideo.load()
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

    this.load = function() {
      newVideo.load()
    };
    this.drawFrame = drawCanvas;
  }

  return videoPlayer;
})(window, document);
export default videoPlayer
