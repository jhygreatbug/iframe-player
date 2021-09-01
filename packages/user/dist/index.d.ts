import type { TPlayerEventType } from '@iframe-player/types';
export interface IPlayerConfig {
    target: HTMLIFrameElement;
    playUrl: string;
    controls?: boolean;
    autoPlay?: boolean;
    allowMutedAutoPlay?: boolean;
    timeout?: number;
}
declare type TCallbackMap = {
    [key: string]: Array<(data: any) => void>;
};
declare type TBeforeEachHook = (ev: TPlayerEventType, v: unknown, cb: (v?: unknown) => void) => void;
export default class IframePlayer {
    config: IPlayerConfig;
    $iframe: HTMLIFrameElement;
    waitQueueMap: TCallbackMap;
    eventHandlerMap: TCallbackMap;
    onMessageHandler: (ev: MessageEvent<unknown>) => void;
    timers: Record<number, number>;
    beforePostHooks: Array<TBeforeEachHook>;
    constructor(config: IPlayerConfig);
    beforePostMessage(hook: TBeforeEachHook): void;
    iframePostMessage<T extends TPlayerEventType>(eventType: T, value?: unknown): void;
    setPlay(): Promise<{
        resolved: boolean;
    }>;
    setPause(): void;
    setMuted(value: {
        muted: boolean;
    }): void;
    setPresentationMode(value: {
        mode: string;
    }): void;
    getDuration(): Promise<unknown>;
    getCurrentTime(): Promise<unknown>;
    getMuted(): Promise<unknown>;
    getPresentationMode(): Promise<unknown>;
    consumer(eventType: string, value: unknown): void;
    on(eventType: string, cb: (value: unknown) => void): void;
    off(eventType: string, cb?: (value: unknown) => void): void;
    trigger(eventType: string, value: unknown): void;
    setConfig(config: Partial<IPlayerConfig>): void;
    destroy(): void;
}
export {};
