export interface IPlayerEventData<T extends TPlayerEventType, U> {
	eventType: T;
	value?: U;
}

export type TPresentationMode = 'inline' | 'picture-in-picture' | 'fullscreen';

// todo: enum
export type TPlayerEventType =
	| 'reply-set-play'
	| 'reply-get-duration'
	| 'reply-get-current-time'
	| 'reply-get-muted'
	| 'reply-get-presentation-mode'
	| 'set-play'
	// play-video为旧名称
	| 'play-video'
	| 'reply-play'
	| 'set-pause'
	// pause-video为旧名称
	| 'pause-video'
	| 'set-muted'
	| 'set-presentation-mode'
	| 'get-duration'
	| 'get-current-time'
	| 'get-muted'
	| 'get-presentation-mode'
	| 'can-play'
	| 'pause'
	| 'play'
	| 'ended'
	| 'time-update'
	| 'volume-change'
	| 'presentation-mode-changed'
	| 'error';

export type TResponseEventType =
	| 'reply-set-play'
	| 'reply-get-duration'
	| 'reply-get-current-time'
	| 'reply-get-muted'
	| 'reply-get-presentation-mode'
	| 'can-play'
	| 'pause'
	| 'play'
	| 'ended'
	| 'time-update'
	| 'volume-change'
	| 'presentation-mode-changed'
	| 'error';

export type TPlayerSetPlayEventData = IPlayerEventData<'set-play', null>;

export type TPlayerReplySetPlayEventData = IPlayerEventData<
	'reply-set-play',
	{ resolved: boolean }
>;

export type TPlayerSetPauseEventData = IPlayerEventData<'set-pause', null>;

export type TPlayerSetMutedData = IPlayerEventData<
	'set-muted',
	{ muted: boolean }
>;

export type TPlayerSetPresentationModeData = IPlayerEventData<
	'set-presentation-mode',
	{ presentationMode: TPresentationMode }
>;

export type TPlayerGetDurationEventData = IPlayerEventData<
	'get-duration',
	null
>;
export type TPlayerReplyGetDurationEventData = IPlayerEventData<
	'reply-get-duration',
	{ seconds: number }
>;

export type TPlayerGetCurrentTimeEventData = IPlayerEventData<
	'get-current-time',
	null
>;
export type TPlayerReplyGetCurrentTimeEventData = IPlayerEventData<
	'reply-get-current-time',
	{ seconds: number }
>;

export type TPlayerGetMutedData = IPlayerEventData<'get-muted', null>;
export type TPlayerReplyGetMutedData = IPlayerEventData<
	'reply-get-muted',
	{ muted: boolean }
>;

export type TPlayerGetPresentationModeEventData = IPlayerEventData<
	'get-presentation-mode',
	null
>;
export type TPlayerReplyGetPresentationModeData = IPlayerEventData<
	'reply-get-presentation-mode',
	{ presentationMode: TPresentationMode }
>;

export type TPlayerCanPlayData = IPlayerEventData<'can-play', null>;

export type TPlayerPauseData = IPlayerEventData<'pause', null>;

export type TPlayerPlayData = IPlayerEventData<'play', null>;

export type TPlayerEndedData = IPlayerEventData<'ended', null>;

export type TPlayerTimeUpdateData = IPlayerEventData<
	'time-update',
	{ currentTime: number }
>;

export type TPlayerVolumeChangeData = IPlayerEventData<
	'volume-change',
	{ volume: number; muted: boolean }
>;

export type TPlayerPresentationModeChangedData = IPlayerEventData<
	'presentation-mode-changed',
	{ presentationMode: TPresentationMode }
>;

export type TPlayerErrorData = IPlayerEventData<'error', { message: string }>;

export type TPlayerEventData =
	| TPlayerSetPlayEventData
	| TPlayerReplySetPlayEventData
	| TPlayerSetPauseEventData
	| TPlayerSetMutedData
	| TPlayerSetPresentationModeData
	| TPlayerGetDurationEventData
	| TPlayerGetCurrentTimeEventData
	| TPlayerGetMutedData
	| TPlayerGetPresentationModeEventData
	| TPlayerCanPlayData
	| TPlayerPauseData
	| TPlayerPlayData
	| TPlayerEndedData
	| TPlayerTimeUpdateData
	| TPlayerVolumeChangeData
	| TPlayerPresentationModeChangedData
	| TPlayerReplyGetMutedData
	| TPlayerReplyGetDurationEventData
	| TPlayerReplyGetCurrentTimeEventData
	| TPlayerReplyGetPresentationModeData
	| TPlayerErrorData;

declare global {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface HTMLVideoElement {
		webkitPresentationMode: TPresentationMode;
		webkitSetPresentationMode: (mode: TPresentationMode) => void;
	}
}
