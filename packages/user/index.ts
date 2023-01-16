import { isPlayerEventData } from '@iframe-player/utils';
import type { TPlayerEventType } from '@iframe-player/types';

export interface IPlayerConfig {
	target: HTMLIFrameElement;
	playUrl: string;
	controls?: boolean;
	autoPlay?: boolean;
	allowMutedAutoPlay?: boolean;
	timeout?: number;
	postStringMessage?: boolean;
}

// todo: 去掉any
type TCallbackMap = { [key: string]: Array<(data: any) => void> }

const REPLY_TIMEOUT = 200;

const modifiableConfig: Array<keyof IPlayerConfig> = [
	'autoPlay',
	'allowMutedAutoPlay',
	'timeout',
];

const replyEvents = [
	'reply-set-play',
	'reply-get-duration',
	'reply-get-current-time',
	'reply-get-muted',
	'reply-get-presentation-mode',
];

// todo
const messageEvents = [
	'can-play',
	'pause',
	'play',
	'ended',
	'time-update',
	'volume-change',
	'presentation-mode-changed',
	'error',
];

const defaultConfig = {
	autoPlay: false,
	allowMutedAutoPlay: false,
	controls: true,
}

const getInitMap = (keys: string[]) => {
	const map: TCallbackMap = {};
	keys.forEach(key => {
		map[key] = [];
	});
	return map;
}

// todo: promise 泛型
function getAttr(instance: IframePlayer, attr: string) {
	return new Promise<unknown>(resolve => {
		// todo: 去掉as
		instance.iframePostMessage(`get-${attr}` as TPlayerEventType);
		const timer = setTimeout(() => {
			resolve(void 0);
		}, REPLY_TIMEOUT);
		instance.waitQueueMap[`reply-get-${attr}`].push((data: unknown) => {
			resolve(data);
			clearTimeout(timer);
		});
	});
}

function onMessage(instance: IframePlayer, { data: refData }: MessageEvent) {
	let data: Object = refData;
	if (typeof data === 'string') {
		try {
			data = JSON.parse(refData)
		} catch {}
	}
	// todo: 判断是哪个实例
	if (!isPlayerEventData(data)) {
		return;
	}
	const eventType = data.eventType;
	instance.consumer(eventType, data.value);
	instance.trigger(eventType, data.value);
}

// todo: url 中已有 controls 的情况处理
function UrlAddControls(url: string) {
	const [prefix, hash] = url.split('#');
	const [path, params] = prefix.split('?');
	if (params?.length) {
		return url.replace(params, params + '&controls=0');
	} else {
		return `${path}?controls=0${hash ? `#${hash}` : ''}`;
	}
}

type TBeforeEachHook = (ev: TPlayerEventType, v: unknown, cb: (v?: unknown) => void) => void;

export default class IframePlayer {
	config: IPlayerConfig;
	$iframe: HTMLIFrameElement;
	waitQueueMap: TCallbackMap;
	eventHandlerMap: TCallbackMap;
	onMessageHandler: (ev: MessageEvent<unknown>) => void;
	timers: Record<number, number>;
	beforePostHooks: Array<TBeforeEachHook>;
	constructor(config: IPlayerConfig) {
		this.config = {
			...defaultConfig,
			...config,
		};
		this.$iframe = config.target;
		this.waitQueueMap = getInitMap(replyEvents);
		this.eventHandlerMap = getInitMap(messageEvents);
		this.timers = {};
		this.beforePostHooks = [];

		this.onMessageHandler = ev => {
			onMessage(this, ev);
		}
		window.addEventListener('message', this.onMessageHandler);

		let firstCanPlay = true;

		this.on('can-play', () => {
			if (!firstCanPlay) {
				return
			}
			firstCanPlay = false;
			// can-play触发前配置可能被修改，所以在can-play触发后再判断
			if (this.config.autoPlay) {
				// todo: 提供专门的自动播放方法
				this.setPlay().then(({ resolved }) => {
					if (resolved) {
						return;
					}
					if (this.config.allowMutedAutoPlay) {
						this.setMuted({ muted: true });
						this.setPlay();
					}
				});
			}
		});

		if (this.config.controls === false) {
			this.config.playUrl = UrlAddControls(config.playUrl);
		}

		const { timeout } = this.config;
		if (typeof timeout === 'number' && timeout > 0) {
			const timer = setTimeout(() => {
				this.trigger('error', { message: 'timeout', code: 0 });
			}, timeout) as unknown as number;
			this.timers[timer] = timer;
			this.on('can-play', () => {
				clearTimeout(timer);
				delete this.timers[timer];
			})
		}

		this.$iframe.src = this.config.playUrl;
	}

	beforePostMessage(hook: TBeforeEachHook) {
		this.beforePostHooks.push(hook);
	}

	iframePostMessage<T extends TPlayerEventType>(eventType: T, value?: unknown) {
		const next = (ev: T, v: unknown, hooksIndex: number) => {
			if (hooksIndex === this.beforePostHooks.length) {
				let data: Object | string = { eventType: ev, value: v };
				if (this.config.postStringMessage) {
					data = JSON.stringify(data);
				}
				this.$iframe.contentWindow?.postMessage(
					data,
					this.config.playUrl,
				);
				return;
			}
			const hook = this.beforePostHooks[hooksIndex];
			hook?.(ev, v, v => {
				next(ev, v, hooksIndex + 1);
			})
		};
		next(eventType, value, 0);
	}

	setPlay() {
		return new Promise<{ resolved: boolean }>(resolve => {

			this.iframePostMessage('set-play');
			this.iframePostMessage('play-video');

			const timer = setTimeout(() => {
				resolve({ resolved: false });
			}, REPLY_TIMEOUT);

			this.waitQueueMap['reply-set-play'].push(data => {
				resolve(data);
				clearTimeout(timer);
			});
		});
	}

	setPause() {
		this.iframePostMessage('set-pause');
		this.iframePostMessage('pause-video');
	}

	setMuted(value: { muted: boolean }) {
		this.iframePostMessage('set-muted', value);
	}

	setPresentationMode(value: { mode: string }) {
		this.iframePostMessage('set-presentation-mode', value);
	}

	getDuration() {
		return getAttr(this, 'duration');
	}

	getCurrentTime() {
		return getAttr(this, 'current-time');
	}

	getMuted() {
		return getAttr(this, 'muted');
	}

	getPresentationMode() {
		return getAttr(this, 'presentation-mode');
	}

	consumer(eventType: string, value: unknown) {
		if (!(replyEvents.indexOf(eventType) >= 0)) {
			return;
		}
		const queue = this.waitQueueMap[eventType];
		const cb = queue.shift();
		if (cb) {
			cb(value);
		}
	}

	// todo: 更多限制
	on(eventType: string, cb: (value: unknown) => void) {
		// eventType检查
		const map = this.eventHandlerMap;
		map[eventType].push(cb);
	}

	// todo: 更多限制
	off(eventType: string, cb?: (value: unknown) => void) {
		// eventType检查
		const map = this.eventHandlerMap;
		if (cb) {
			const index = map[eventType].indexOf(cb);
			if (index < 0) {
				return;
			}
			map[eventType].splice(index, 1);
		} else {
			map[eventType] = [];
		}
	}

	trigger(eventType: string, value: unknown) {
		if (!(messageEvents.indexOf(eventType) >= 0)) {
			return;
		}
		const queue = this.eventHandlerMap[eventType];
		queue.forEach(cb => {
			cb(value);
		});
	}

	setConfig(config: Partial<IPlayerConfig>) {
		for (const key in config) {
			// todo
			if (modifiableConfig.indexOf(key as 'playUrl') >= 0) {
				this.config[key as 'playUrl'] = config[key as 'playUrl'] as string;
			}
		}
	}

	destroy() {
		window.removeEventListener('message', this.onMessageHandler);
		for (const timer in this.timers) {
			clearTimeout(timer as unknown as ReturnType<typeof setTimeout>);
		}
	}
}
