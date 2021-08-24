import type {
	TPlayerEventData,
	TPlayerSetMutedData,
	TPlayerSetPresentationModeData,
} from '@iframe-player/types';
import { isPlayerEventData } from '@iframe-player/utils';

// 插件的所有行为对应的方法
const playerActions = {
	setPlay(this: PlayerAgent) {
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
	setPause(this: PlayerAgent) {
		this.config.$video.pause();
	},
	setMuted(this: PlayerAgent, value: TPlayerSetMutedData['value']) {
		if (!value || !('muted' in value)) {
			return;
		}
		this.config.$video.muted = value.muted;
	},
	setPresentationMode(
		this: PlayerAgent,
		value: TPlayerSetPresentationModeData['value'],
	) {
		if (!value || !('presentationMode' in value)) {
			return;
		}
		this.config.$video.webkitSetPresentationMode(value.presentationMode);
	},
	getDuration(this: PlayerAgent) {
		this.postVideoMessage({
			eventType: 'reply-get-duration',
			value: { seconds: this.config.$video.duration },
		});
	},
	getCurrentTime(this: PlayerAgent) {
		this.postVideoMessage({
			eventType: 'reply-get-current-time',
			value: { seconds: this.config.$video.currentTime },
		});
	},
	getMuted(this: PlayerAgent) {
		this.postVideoMessage({
			eventType: 'reply-get-muted',
			value: { muted: this.config.$video.muted },
		});
	},
	getPresentationMode(this: PlayerAgent) {
		this.postVideoMessage({
			eventType: 'reply-get-presentation-mode',
			value: {
				presentationMode: this.config.$video.webkitPresentationMode,
			},
		});
	},
	canPlay(this: PlayerAgent) {
		this.postVideoMessage({
			eventType: 'can-play',
			value: null,
		});
	},
	pause(this: PlayerAgent) {
		this.postVideoMessage({
			eventType: 'pause',
			value: null,
		});
	},
	play(this: PlayerAgent) {
		this.postVideoMessage({
			eventType: 'play',
			value: null,
		});
	},
	ended(this: PlayerAgent) {
		this.postVideoMessage({
			eventType: 'ended',
			value: null,
		});
	},
	timeUpdate(this: PlayerAgent) {
		this.postVideoMessage({
			eventType: 'time-update',
			value: {
				currentTime: this.config.$video.currentTime,
			},
		});
	},
	volumeChange(this: PlayerAgent) {
		this.postVideoMessage({
			eventType: 'volume-change',
			value: {
				volume: this.config.$video.volume,
				muted: this.config.$video.muted,
			},
		});
	},
	presentationModeChanged(this: PlayerAgent) {
		this.postVideoMessage({
			eventType: 'presentation-mode-changed',
			value: {
				presentationMode: this.config.$video.webkitPresentationMode,
			},
		});
	},
	error(this: PlayerAgent, error: Error) {
		this.postVideoMessage({
			eventType: 'error',
			value: {
				message: `${error.name}: ${error.message}`,
			},
		});
	},
};

interface IPlayerAgentConfig {
	$video: HTMLVideoElement;
	targetWindow: Window;
	actions?: Partial<typeof playerActions>;
}

export default class PlayerAgent {
	config: IPlayerAgentConfig;
	actions: typeof playerActions;
	constructor(config: IPlayerAgentConfig) {
		this.config = { ...config };
		this.actions = { ...playerActions };

		if (!(config.$video instanceof HTMLVideoElement)) {
			playerActions.error.call(
				this,
				new TypeError(`config.$video 不是 HTMLVideoElement 实例; ${
					Object.prototype.toString.call(config.$video)
				}`),
			);
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

		const { $video } = config;

		const playerActionsKeys = [
			'canPlay',
			'pause',
			'play',
			'ended',
			'timeUpdate',
			'volumeChange',
			'presentationModeChanged',
		] as const;

		playerActionsKeys.forEach(eventType => {
			$video.addEventListener(eventType.toLowerCase(), () => {
				playerActions[eventType].call(this);
			});
		});

		window.addEventListener(
			'message',
			({ data }) => {
				if (!isPlayerEventData(data)) {
					return;
				}

				switch (data.eventType) {
					case 'set-play': {
						playerActions.setPlay.call(this);
						break;
					}
					case 'set-pause': {
						playerActions.setPause.call(this);
						break;
					}
					case 'set-muted': {
						playerActions.setMuted.call(this, data.value);
						break;
					}
					case 'set-presentation-mode': {
						playerActions.setPresentationMode.call(
							this,
							data.value,
						);
						break;
					}
					case 'get-duration': {
						playerActions.getDuration.call(this);
						break;
					}
					case 'get-current-time': {
						playerActions.getCurrentTime.call(this);
						break;
					}
					case 'get-muted': {
						playerActions.getMuted.call(this);
						break;
					}
					case 'get-presentation-mode': {
						playerActions.getPresentationMode.call(this);
						break;
					}
					default:
						break;
				}
			},
			false,
		);
	}

	postVideoMessage(data: TPlayerEventData) {
		this.config.targetWindow.postMessage(data, '*');
	}
}
