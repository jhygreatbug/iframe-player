import type { TPlayerEventData, TPlayerSetMutedData, TPlayerSetPresentationModeData } from '@iframe-player/types';
declare const playerActions: {
    setPlay(this: PlayerAgent): void;
    setPause(this: PlayerAgent): void;
    setMuted(this: PlayerAgent, value: TPlayerSetMutedData['value']): void;
    setPresentationMode(this: PlayerAgent, value: TPlayerSetPresentationModeData['value']): void;
    getDuration(this: PlayerAgent): void;
    getCurrentTime(this: PlayerAgent): void;
    getMuted(this: PlayerAgent): void;
    getPresentationMode(this: PlayerAgent): void;
    canPlay(this: PlayerAgent): void;
    pause(this: PlayerAgent): void;
    play(this: PlayerAgent): void;
    ended(this: PlayerAgent): void;
    timeUpdate(this: PlayerAgent): void;
    volumeChange(this: PlayerAgent): void;
    presentationModeChanged(this: PlayerAgent): void;
    error(this: PlayerAgent, error: Error): void;
};
interface IPlayerAgentConfig {
    $video: HTMLVideoElement;
    targetWindow: Window;
    actions?: Partial<typeof playerActions>;
}
export default class PlayerAgent {
    config: IPlayerAgentConfig;
    actions: typeof playerActions;
    constructor(config: IPlayerAgentConfig);
    postVideoMessage(data: TPlayerEventData): void;
}
export {};
