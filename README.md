# canvas-merge-video-in-vue

##组件引入方式(暂时有问题)
```
1.npm install canvasmergevideo --save

```
##组件使用
```
import MergeVideo from 'canvasmergevideo'
Vue.use(MergeVideo)
```
```
<template>
  <div id="app">
    <merge-video :playList='playList' :autoPlay='autoPlay'></merge-video>
  </div>
</template>
```
##需要引入 elmenet-ui的css
```
// 因为我后续在拓展的时候需要用到element-ui所以引入了这个ui
// 在项目的开始
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-default/index.css">
```
##组件传参说明
```
autoPlay: false, // 是否自动播放 Boolean
playList: [] // 碎片列表 Array
sounds: Number// 声音 Number
```



>如果需要 fork项目 clone之后，安装方法如下


## fork项目跑起来

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```
# canvas-merge-video-in-vue 利用canvas+vue进行视频碎片合并
## 此pro注意点：
1.并没有考虑性能
2.只支持温柔使用
3.没有catch error状态
4.loading状态正在完善中
> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```
## 组件内部默认data对象说明

```
currentEnoughToPlay: false, // 表示是否需要显示enoughToPlay状态
pauseing: true, // 暂停状态
playing: false, // 播放状态
sounds: 10, // 声音控制
mutedable: false, // 是否静音
progress: 0, // 进度条
allLength: 0, // 总长度.这个是需要后端返回的
currentTimeLabel: '0:00', // 默认播放时间 用来显示
terminalTimeLabel: '', // 终点时间
currentTime: 0, // 当前时间
currentIndex: 0, // 默认当前播放碎片指引
videoInstance: null, // 当前激活的视频实例
canvasInstance: null, // canvas 实例

```

## 实现思路
1.先把所有视频碎片丢到`dom`里面

2.控制当前碎片指引，进行实例`dom`切换

3.`video`的`currentTime`只要`video`能播放就会改变，通过这个属性监控触发 `canvas`的`drawimage`

4.通过`canvas` 去`drawimage`去抓取当前碎片（也就是指引指向的那个`video`实例）

5.通过`video`的`onend`事件连接碎片

## 存在问题

1.来回拖动进度条的时候可能会出现卡顿现象视频 报错

2.兼容性问题

3.。
