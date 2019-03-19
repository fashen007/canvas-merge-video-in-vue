# canvas-merge-video-in-vue

##[demo](https://spademan.github.io/canvas-merge-video-in-vue/#/)

##一.组件形式使用

###组件引入方式
```
1.npm install canvasmergevideo --save

```
###html文件中
```
import MergeVideo from 'canvasmergevideo'
Vue.use(MergeVideo)

```

```
<template>
  <div id="app">
    <merge-video :playList='playList' :autoPlay='autoPlay' :audioSrc='audioSrc'></merge-video>
  </div>
</template>

```

```
autoPlay: false, // 是否自动播放 Boolean(required)
playList: [] // 碎片列表 Array（）
sounds: Number// 声音 Number（非必填）
audioSrc: String// 第三方声音（必填）

picOption: { // 水印配置
  editLogo: false, // // 是否需要调整水印
  logoSrc: require('./assets/logo.png'), //水印地址
  info: {
    w: 60, // 宽
    h: 60, // 高
    x: 0 // logo相对画布x轴起点
    y: 0 // logo相对画布y轴起点
  }
},
```
###另外需要引入 elmenet-ui的css
```
// 因为我后续在拓展的时候需要用到element-ui所以引入了这个ui
// 在项目的开始
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-default/index.css">
```



##二. fork项目跑起来 (想自己改造源码的同学可以看这个步骤)
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```
### 此pro注意点：
```
1.并没有考虑性能
2.只支持温柔使用
3.没有catch error状态
4.loading状态正在完善中
```
### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

```
### 组件内部默认data对象说明
```
progress: 0, // 进度条
allLength: 0, // 总长度.这个是需要后端返回的
currentTimeLabel: '0:00', // 默认播放时间 用来显示
terminalTimeLabel: '', // 终点时间
currentTime: 0, // 当前时间
currentIndex: 0, // 默认当前播放碎片指引
currentEnoughToPlay: false, // 表示是否需要显示enoughToPlay状态
loading: true, // loading状态
videoPauseing: true, // 暂停状态
audioPlaying: false, // 音频播放状态
mutedable: false, // 是否静音
videoInstance: null, // 当前激活的视频实例
canvasInstance: null // canvas 实

```

### 实现思路
1.先把所有视频碎片丢到`dom`里面

2.控制当前碎片指引，进行实例`dom`切换

3.`video`的`currentTime`只要`video`能播放就会改变，通过这个属性监控触发 `canvas`的`drawimage`

4.通过`canvas` 去`drawimage`去抓取当前碎片（也就是指引指向的那个`video`实例）

5.通过`video`的`onend`事件连接碎片

### 存在问题

1.来回拖动进度条的时候可能会出现卡顿现象视频 报错

2.兼容性问题

3.移动端播放全屏有兼容性问题

### 参考
https://www.w3.org/2010/05/video/mediaevents.html
