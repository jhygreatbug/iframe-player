# iframe-player-provider

## 浏览器支持

IE9+

## 安装

在浏览器中使用：

```html
<body>

  <!-- 引入源文件 -->
  <script src="path/to/index.iife.min.js"></script>

  <script>
    var player = new IframePlayerProvider({
      // config
    });
  </script>
</body>
```

使用 npm：

```
npm install @iframe-player/provide --save
```

使用 yarn：

```
yarn add @iframe-player/provide
```

在 Node.js 中：

```javascript
// ESModule
import IframePlayerProvider from '@iframe-player/provider';

// CommonJS
var IframePlayerProvider = require('@iframe-player/provider/index.cjs.js');
```

## 初始化 & 配置

引入后, 需要初始化 IframePlayerProvider

```javascript
var player = new IframePlayerProvider(config);
```

`config` 是一个必填的 object 对象，具体配置如下：

```javascript
var config = {
  // video 元素
  $video: $video,
  // 父级页面的window对象
  targetWindow: window.parent,
  // 利用actions配置，能够覆盖插件原本的行为
  // 这个配置会覆盖 index.ts: playerActions 对象对应的方法
  // 如果没有自定义插件行为的需要，可以忽略这项配置
  actions: {
    getDuration() {
      // 将 getDuration 原本的逻辑复制过来，保证基础的交互行为
      this.postVideoMessage({
        eventType: "reply-get-duration",
        value: { seconds: this.config.$video.duration }
      });
      // 加入你的代码
    }
  }
};
```
