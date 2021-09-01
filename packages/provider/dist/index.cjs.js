'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function isObject(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
}
var isPlayerEventData = function (data) {
    return isObject(data) && ('eventType' in data);
};

// 插件的所有行为对应的方法
var playerActions = {
    setPlay: function () {
        var _this = this;
        var res = this.config.$video.play();
        if (typeof Promise !== "undefined" && Promise.toString().indexOf("[native code]") !== -1) {
            res.then(function () {
                _this.postVideoMessage({
                    eventType: 'reply-set-play',
                    value: { resolved: true },
                });
            })
                .catch(function () {
                _this.postVideoMessage({
                    eventType: 'reply-set-play',
                    value: { resolved: false },
                });
            });
        }
        else {
            var paused = this.config.$video.paused;
            this.postVideoMessage({
                eventType: 'reply-set-play',
                value: { resolved: !paused },
            });
        }
    },
    setPause: function () {
        this.config.$video.pause();
    },
    setMuted: function (value) {
        if (!value || !('muted' in value)) {
            return;
        }
        this.config.$video.muted = value.muted;
    },
    setPresentationMode: function (value) {
        if (!value || !('presentationMode' in value)) {
            return;
        }
        this.config.$video.webkitSetPresentationMode(value.presentationMode);
    },
    getDuration: function () {
        this.postVideoMessage({
            eventType: 'reply-get-duration',
            value: { seconds: this.config.$video.duration },
        });
    },
    getCurrentTime: function () {
        this.postVideoMessage({
            eventType: 'reply-get-current-time',
            value: { seconds: this.config.$video.currentTime },
        });
    },
    getMuted: function () {
        this.postVideoMessage({
            eventType: 'reply-get-muted',
            value: { muted: this.config.$video.muted },
        });
    },
    getPresentationMode: function () {
        this.postVideoMessage({
            eventType: 'reply-get-presentation-mode',
            value: {
                presentationMode: this.config.$video.webkitPresentationMode,
            },
        });
    },
    canPlay: function () {
        this.postVideoMessage({
            eventType: 'can-play',
            value: null,
        });
    },
    pause: function () {
        this.postVideoMessage({
            eventType: 'pause',
            value: null,
        });
    },
    play: function () {
        this.postVideoMessage({
            eventType: 'play',
            value: null,
        });
    },
    ended: function () {
        this.postVideoMessage({
            eventType: 'ended',
            value: null,
        });
    },
    timeUpdate: function () {
        this.postVideoMessage({
            eventType: 'time-update',
            value: {
                currentTime: this.config.$video.currentTime,
            },
        });
    },
    volumeChange: function () {
        this.postVideoMessage({
            eventType: 'volume-change',
            value: {
                volume: this.config.$video.volume,
                muted: this.config.$video.muted,
            },
        });
    },
    presentationModeChanged: function () {
        this.postVideoMessage({
            eventType: 'presentation-mode-changed',
            value: {
                presentationMode: this.config.$video.webkitPresentationMode,
            },
        });
    },
    error: function (error) {
        this.postVideoMessage({
            eventType: 'error',
            value: {
                message: error.name + ": " + error.message,
            },
        });
    },
};
var PlayerAgent = /** @class */ (function () {
    function PlayerAgent(config) {
        var _this = this;
        var _a;
        this.config = __assign({}, config);
        this.actions = __assign({}, playerActions);
        if (!(config.$video instanceof HTMLVideoElement)) {
            playerActions.error.call(this, new TypeError("config.$video \u4E0D\u662F HTMLVideoElement \u5B9E\u4F8B; " + Object.prototype.toString.call(config.$video)));
        }
        var configActions = (_a = config.actions) !== null && _a !== void 0 ? _a : {};
        Object.keys(configActions).forEach(function (refKey) {
            // todo: 尽可能去掉as
            if (!(refKey in playerActions) ||
                typeof configActions[refKey] !== 'function') {
                return;
            }
            var key = refKey;
            _this.actions[key] = configActions[key];
        });
        var $video = config.$video;
        var playerActionsKeys = [
            'canPlay',
            'pause',
            'play',
            'ended',
            'timeUpdate',
            'volumeChange',
            'presentationModeChanged',
        ];
        playerActionsKeys.forEach(function (eventType) {
            $video.addEventListener(eventType.toLowerCase(), function () {
                playerActions[eventType].call(_this);
            });
        });
        window.addEventListener('message', function (_a) {
            var data = _a.data;
            if (!isPlayerEventData(data)) {
                return;
            }
            switch (data.eventType) {
                case 'set-play': {
                    playerActions.setPlay.call(_this);
                    break;
                }
                case 'set-pause': {
                    playerActions.setPause.call(_this);
                    break;
                }
                case 'set-muted': {
                    playerActions.setMuted.call(_this, data.value);
                    break;
                }
                case 'set-presentation-mode': {
                    playerActions.setPresentationMode.call(_this, data.value);
                    break;
                }
                case 'get-duration': {
                    playerActions.getDuration.call(_this);
                    break;
                }
                case 'get-current-time': {
                    playerActions.getCurrentTime.call(_this);
                    break;
                }
                case 'get-muted': {
                    playerActions.getMuted.call(_this);
                    break;
                }
                case 'get-presentation-mode': {
                    playerActions.getPresentationMode.call(_this);
                    break;
                }
            }
        }, false);
    }
    PlayerAgent.prototype.postVideoMessage = function (data) {
        this.config.targetWindow.postMessage(data, '*');
    };
    return PlayerAgent;
}());

module.exports = PlayerAgent;
