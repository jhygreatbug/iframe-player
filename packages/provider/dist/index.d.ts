import type { TPlayerEventData, TPlayerSetMutedData, TPlayerSetPresentationModeData } from '@iframe-player/types';
declare const playerActions: {
    setPlay(this: IframePlayerProvider): void;
    setPause(this: IframePlayerProvider): void;
    setMuted(this: IframePlayerProvider, value: TPlayerSetMutedData['value']): void;
    setPresentationMode(this: IframePlayerProvider, value: TPlayerSetPresentationModeData['value']): void;
    getDuration(this: IframePlayerProvider): void;
    getCurrentTime(this: IframePlayerProvider): void;
    getMuted(this: IframePlayerProvider): void;
    getPresentationMode(this: IframePlayerProvider): void;
    canPlay(this: IframePlayerProvider): void;
    pause(this: IframePlayerProvider): void;
    play(this: IframePlayerProvider): void;
    ended(this: IframePlayerProvider): void;
    timeUpdate(this: IframePlayerProvider): void;
    volumeChange(this: IframePlayerProvider): void;
    presentationModeChanged(this: IframePlayerProvider): void;
    error(this: IframePlayerProvider, error: Error): void;
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
    constructor(config: IframePlayerProviderConfig);
    postVideoMessage(data: TPlayerEventData): void;
}
export {};
