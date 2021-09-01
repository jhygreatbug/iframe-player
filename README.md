# iframe 播放器

## 简介

该项目以通信协议为核心，辅助建设 iframe 播放器提供方和使用方之间的交互能力。

## 播放器提供方

### 如何接入

方式一：使用 IframePlayerProvider 插件（推荐）

使用 IframePlayerProvider 插件，能够快速接入交互能力。插件的使用方式参照 [IframePlayerProvider 文档](./packages/provider/README.md) 。

方式二：按照通信协议自主实现交互能力

参见 [iframe 播放器通信协议](./docs/protocol.md) 。

### 调试

`cd test-page/user && yarn serve`

在打开的新页面中调试你的播放器

## 播放器使用方

### 如何接入

方式一：使用 IframePlayer 插件（推荐）

使用 IframePlayer 插件，能够快速接入交互能力。插件的使用方式参照 [IframePlayer 文档](./packages/user/README.md) 。

方式二：按照通信协议自主实现交互能力

参见 [iframe 播放器通信协议](./docs/protocol.md) 。

### 调试

`cd test-page/provider && yarn serve`

使用打开的链接作为测试播放器的url

## 开发

参见 [DEV.md](./DEV.md)
