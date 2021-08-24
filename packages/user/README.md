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
    var player = new IframePlayer({
      // config
    });
  </script>
</body>
```

使用 npm：

```
npm install @iframe-player/user --save
```

使用 yarn：

```
yarn add @iframe-player/user
```

在 Node.js 中：

```javascript
// ESModule
import IframePlayer from '@iframe-player/user';

// CommonJS
var IframePlayer = require('@iframe-player/user/index.cjs.js');
```

## 初始化 & 配置

引入后, 需要初始化 IframePlayer

```javascript
var player = new IframePlayer(config);
```

`config` 是一个必填的 object 对象，具体配置如下：

```javascript
var config = {
	// iframe 元素
	target: $iframe,
	// 播放器 url
	playUrl: '/player',
	// 是否显示播放器控件，默认为 true
	controls: true,
	// 是否自动播放，默认为 false
	autoPlay: false,
	// 是否允许静音自动播放，默认为 false
	allowMutedAutoPlay: false,
	// 播放器初始化超过多少毫秒，则认为初始化失败，触发 error 事件。当timeout不为大于0的数字时，认为无超时设置。默认为 undefined
	timeout: 0,
};
```
