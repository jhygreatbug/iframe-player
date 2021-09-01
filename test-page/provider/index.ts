import IframePlayerProvider from '@iframe-player/provider';
const $video = document.getElementById("video") as HTMLVideoElement;
const searchParams = new URLSearchParams(window.location.search);
const src = searchParams.get("src") || "";
if (src) {
  $video.src = src;
}
new IframePlayerProvider({
	// video 元素
	$video: $video,
	// 父级页面的window对象
	targetWindow: window.parent,
	// 覆盖插件原本的行为
	actions: {
		getDuration: function () {
			this.postVideoMessage({
				eventType: "reply-get-duration",
				value: { seconds: this.config.$video.duration },
			});
		},
	},
});
