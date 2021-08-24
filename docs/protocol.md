# iframe 播放器通信协议

## 通信能力

iframe 播放器与父级页面之间的交互，主要使用 `window.postMessage` 进行通信。

### 播放控制

父级页面会主动发送 `postMessage` 信息。iframe 播放器接收到消息后，调用video元素对应的方法。

需要建设的控制能力：

- 播放视频
- 暂停视频
- 设置静音
- iOS下设置 presentationMode 状态

### 检索视频信息

父级页面会主动发送 `postMessage` 信息。iframe 播放器接收到消息后，获取 video 元素对应的属性，通过 `postMessage` 方法回传属性值。

需要回传的属性：

- duration
- currentTime
- muted
- presentationMode（iOS专用）

### 事件传递

iframe 播放器监听 video 元素的部分时间。当事件被触发时，通过 `postMessage` 向父级页面传递播放器发生的变化。

需要传递的事件包含：

- canplay
- pause
- play
- ended
- timeupdate
- volumechange
- presentationmodechanged（iOS 专用）

## 通信协议

*如果你已经接入了 IframePlayerProvider 插件，并且没有自定义插件行为的需求，可以忽略以下内容。*

播放器与父级页面之间，使用 `postMessage` 方法进行通信。播放器向父级页面发送的数据，和播放器接收到父级页面的数据，称为事件对象。事件对象具有以下属性：

- `eventType`: 用于指定事件名称；
- `value`: 用于指定与事件相关的值。

示例：

```javascript
var eventData = {
  eventType: 'reply-get-duration',
  value: { seconds: 152 }
}
```

### 播放控制

#### play-video

接收消息: `{ eventType: 'set-play' }`

回复消息: `{ eventType: 'reply-set-play', value: { resolved: Boolean } }`

播放当前视频。视频元素的 `play` 方法会返回一个 `Promise` 。当视频成功播放时， `Promise` 被 `resolve` ，返回 `true` ；当视频播放被拒绝时， `Promise` 被 `reject` ，返回 `false` 。对应原生的 `play` 方法

#### pause-video

接收消息: `{ eventType: 'set-pause' }`

暂停当前视频。当视频已播放结束时，播放器的状态不会改变。对应原生的 `pause` 方法。

#### set-muted

接收消息: `{ eventType: 'set-muted', value: { muted: Boolean } }`

设置播放器是否静音。对应原生的 `muted` 属性。

#### set-presentation-mode

接收消息: `{ eventType: 'set-presentation-mode', value: { presentationMode: String } }`

iOS 专用。设置视频处于画中画、全屏、内联中的哪种模式。对应原生的 `webkitSetPresentationMode` 方法。

### 检索视频信息

#### get-duration

接收消息: `{ eventType: 'get-duration' }`

回复消息: `{ eventType: 'reply-get-duration', value: { seconds: Number } }`

返回视频的总时长（以秒为单位）。对应原生的 `duration` 属性。

#### get-current-time

接收消息: `{ eventType: 'get-current-time' }`

回复消息: `{ eventType: 'reply-get-current-time', value: { seconds: Number } }`

返回视频当前播放的位置（以秒为单位）。对应原生的 `currentTime` 属性。

#### get-muted

接收消息: `{ eventType: 'get-muted' }`

回复消息: `{ eventType: 'reply-get-muted', value: { muted: Boolean } }`

如果播放器处于静音状态，则返回 `true` ；否则返回 `false` 。对应原生的 `muted` 属性。

#### get-presentation-mode

接收消息: `{ eventType: 'get-presentation-mode' }`

回复消息: `{ eventType: 'reply-get-presentation-mode', value: { presentationMode: String } }`

iOS 专用。返回视频处于画中画、全屏、内联中的哪种模式。对应原生的 `webkitPresentationMode` 属性。

### 事件

您需要监听播放器的一些原生事件，并向父级页面传递播放器发生的变化。

以下列表定义了需要传递哪些事件：

#### can-play

发送消息: `{ eventType: 'can-play' }`

浏览器可以播放视频时触发。对应原生的 `canplay` 事件。

#### pause

发送消息: `{ eventType: 'pause' }`

视频暂停时触发。对应原生的 `pause` 事件。

#### play

发送消息: `{ eventType: 'play' }`

视频被暂停后再次开始时触发。对应原生的 `play` 事件。

#### ended

发送消息: `{ eventType: 'ended' }`

视频播放结束时触发。对应原生的 `ended` 事件。

#### time-update

发送消息: `{ eventType: 'time-update', value: { currentTime: Number } }`

`video` 元素的 `currentTime` 属性改变时触发。对应原生的 `timeupdate` 事件。需要传递 `currentTime` 的值。

#### volume-change

发送消息: `{ eventType: 'volume-change', value: { volume: Number } }`

音量改变时触发（既可以是 `volume` 属性改变，也可以是 `muted` 属性改变）。对应原生的 `volumechange` 事件。需要传递 `volume` 的值。

#### presentation-mode-changed

发送消息: `{ eventType: 'presentation-mod-changed', value: { presentationMode: String } }`

iOS 专用。视频的 `webkitPresentationMode` 属性（表示视频处于画中画、全屏、内联中的哪种模式）改变时触发。对应原生的 `webkitpresentationmodechanged` 事件。需要传递
`webkitPresentationMode` 的值。

#### error

发送消息: `{ eventType: 'error', value: { message: String } }`

发生播放器无法正常使用的情况时，触发 error 事件。value 建议传递 ``${error.name}: ${error.message}``
