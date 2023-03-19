import type {
	TPlayerEventData,
	TPlayerSetMutedData,
	TPlayerSetPresentationModeData,
} from '@iframe-player/types';
import { isPlayerEventData, parseUrlSearchParams } from '@iframe-player/utils';

// 插件的所有行为对应的方法
const playerActions = {
	setPlay(this: IframePlayerProvider) {
		const res = this.config.$video.play();
		if (typeof Promise !== "undefined" && Promise.toString().indexOf("[native code]") !== -1) {
			res.then(() => {
				this.postVideoMessage({
					eventType: 'reply-set-play',
					value: { resolved: true },
				});
			})
			.catch(() => {
				this.postVideoMessage({
					eventType: 'reply-set-play',
					value: { resolved: false },
				});
			});
		} else {
			const paused = this.config.$video.paused;
			this.postVideoMessage({
				eventType: 'reply-set-play',
				value: { resolved: !paused },
			});
		}
	},
	setPause(this: IframePlayerProvider) {
		this.config.$video.pause();
	},
	setMuted(this: IframePlayerProvider, value: TPlayerSetMutedData['value']) {
		if (!value || !('muted' in value)) {
			return;
		}
		this.config.$video.muted = value.muted;
	},
	setPresentationMode(
		this: IframePlayerProvider,
		value: TPlayerSetPresentationModeData['value'],
	) {
		if (!value || !('presentationMode' in value)) {
			return;
		}
		this.config.$video.webkitSetPresentationMode(value.presentationMode);
	},
	getDuration(this: IframePlayerProvider) {
		this.postVideoMessage({
			eventType: 'reply-get-duration',
			value: { seconds: this.config.$video.duration },
		});
	},
	getCurrentTime(this: IframePlayerProvider) {
		this.postVideoMessage({
			eventType: 'reply-get-current-time',
			value: { seconds: this.config.$video.currentTime },
		});
	},
	getMuted(this: IframePlayerProvider) {
		this.postVideoMessage({
			eventType: 'reply-get-muted',
			value: { muted: this.config.$video.muted },
		});
	},
	getPresentationMode(this: IframePlayerProvider) {
		this.postVideoMessage({
			eventType: 'reply-get-presentation-mode',
			value: {
				presentationMode: this.config.$video.webkitPresentationMode,
			},
		});
	},

	getPlayBackRate(this: IframePlayerProvider) {
		this.postVideoMessage({
			eventType: 'reply-get-playback-rate',
			value: {
				playbackRate: this.config.$video.playbackRate,
				currentTime: this.config.$video.currentTime,
			}
		})
	},

	canPlay(this: IframePlayerProvider) {
		this.postVideoMessage({
			eventType: 'can-play',
			value: null,
		});
	},
	pause(this: IframePlayerProvider) {
		this.postVideoMessage({
			eventType: 'pause',
			value: null,
		});
	},
	play(this: IframePlayerProvider) {
		this.postVideoMessage({
			eventType: 'play',
			value: null,
		});
	},
	ended(this: IframePlayerProvider) {
		this.postVideoMessage({
			eventType: 'ended',
			value: null,
		});
	},
	timeUpdate(this: IframePlayerProvider) {
		this.postVideoMessage({
			eventType: 'time-update',
			value: {
				currentTime: this.config.$video.currentTime,
			},
		});
	},
	volumeChange(this: IframePlayerProvider) {
		this.postVideoMessage({
			eventType: 'volume-change',
			value: {
				volume: this.config.$video.volume,
				muted: this.config.$video.muted,
			},
		});
	},

	seeking(this: IframePlayerProvider) {
		this.postVideoMessage({
			eventType: 'seeking',
			value: {
				currentTime: this.config.$video.currentTime,
			},
		})
	},

	seeked(this: IframePlayerProvider) {
		this.postVideoMessage({
			eventType: 'seeked',
			value: {
				currentTime: this.config.$video.currentTime,
			},
		})
	},

	rateChange(this: IframePlayerProvider) {
		this.postVideoMessage({
			eventType: 'rate-change',
			value: {
				playbackRate: this.config.$video.playbackRate,
				currentTime: this.config.$video.currentTime,
			}
		})
	},

	presentationModeChanged(this: IframePlayerProvider) {
		this.postVideoMessage({
			eventType: 'presentation-mode-changed',
			value: {
				presentationMode: this.config.$video.webkitPresentationMode,
			},
		});
	},
	error(this: IframePlayerProvider, error: Error) {
		this.postVideoMessage({
			eventType: 'error',
			value: {
				message: `${error.name}: ${error.message}`,
			},
		});
	},
};

interface IframePlayerProviderConfig {
	$video: HTMLVideoElement;
	targetWindow: Window;
	controls?: boolean;
	actions?: Partial<typeof playerActions>;
}

export default class IframePlayerProvider {
	config: IframePlayerProviderConfig;
	actions: typeof playerActions;
	constructor(config: IframePlayerProviderConfig) {
		this.config = { ...config };
		this.actions = { ...playerActions };

		const $video = config.$video;

		if (!($video instanceof HTMLVideoElement)) {
			playerActions.error.call(
				this,
				new TypeError(`config.$video 不是 HTMLVideoElement 实例; ${
					Object.prototype.toString.call(config.$video)
				}`),
			);
		}

		// video 元素 controls属性相关规则:
		// 1. 优先取决于配置项：controls=true ，video 增加 controls 属性；controls=false ，video 移除 controls 属性；
		// 2. 其次取决于 url search params：controls=0，移除 controls属性；
		// 3. 不满足以上情况，不做处理。
		const controls = typeof config.controls === 'undefined'
			? parseUrlSearchParams(location.search).controls !== '0'
			: config.controls;
		if (controls) {
			$video.setAttribute('controls', 'controls');
		} else {
			$video.removeAttribute('controls');
		}

		const configActions = config.actions ?? {};

		Object.keys(configActions).forEach(refKey => {
			// todo: 尽可能去掉as
			if (
				!(refKey in playerActions) ||
				typeof configActions[refKey as 'setPlay'] !== 'function'
			) {
				return;
			}
			const key = refKey as keyof typeof playerActions;
			this.actions[key as 'setPlay'] = configActions[key] as typeof playerActions.setPlay;
		});

		const playerActionsKeys = [
			'canPlay',
			'pause',
			'play',
			'ended',
			'timeUpdate',
			'volumeChange',
			'seeking',
			'seeked',
			'rateChange',
			'presentationModeChanged',
		] as const;

		playerActionsKeys.forEach(eventType => {
			$video.addEventListener(eventType.toLowerCase(), (ev) => {
				playerActions[eventType].call(this);
			});
		});

		window.addEventListener(
			'message',
			({ data: refData }) => {
				let data: Object = refData;
				try {
					if (typeof data === 'string') {
						data = JSON.parse(refData)
					}
				} catch {}
				if (!isPlayerEventData(data)) {
					return;
				}

				switch (data.eventType) {
					case 'set-play': {
						this.actions.setPlay.call(this);
						break;
					}
					case 'set-pause': {
						this.actions.setPause.call(this);
						break;
					}
					case 'set-muted': {
						this.actions.setMuted.call(this, data.value);
						break;
					}
					case 'set-presentation-mode': {
						this.actions.setPresentationMode.call(
							this,
							data.value,
						);
						break;
					}
					case 'get-duration': {
						this.actions.getDuration.call(this);
						break;
					}
					case 'get-current-time': {
						this.actions.getCurrentTime.call(this);
						break;
					}
					case 'get-muted': {
						this.actions.getMuted.call(this);
						break;
					}
					case 'get-presentation-mode': {
						this.actions.getPresentationMode.call(this);
						break;
					}
					case 'get-playback-rate': {
						this.actions.getPlayBackRate.call(this);
					}
					default:
						break;
				}
			},
			false,
		);
	}

	postVideoMessage(data: TPlayerEventData) {
		this.config.targetWindow.postMessage(JSON.stringify(data), '*');
	}
}
