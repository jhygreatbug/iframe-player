var IframePlayerProvider = (function () {
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
    var getDecodeURIComponent = function (s) {
        try {
            return decodeURIComponent(s);
        }
        catch (_a) {
            return s;
        }
    };
    function parseUrlSearchParams(search) {
        var params = search.replace(/^\?/, '').split('&');
        var result = {};
        params.forEach(function (item) {
            if (!item) {
                return;
            }
            var eqIndex = item.indexOf('=');
            if (eqIndex === -1) {
                var key_1 = getDecodeURIComponent(item);
                result[key_1] = '';
                return;
            }
            var key = getDecodeURIComponent(item.slice(0, eqIndex));
            var val = getDecodeURIComponent(item.slice(eqIndex + 1));
            result[key] = val;
        });
        return result;
    }

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
    var IframePlayerProvider = /** @class */ (function () {
        function IframePlayerProvider(config) {
            var _this = this;
            var _a;
            this.config = __assign({}, config);
            this.actions = __assign({}, playerActions);
            var $video = config.$video;
            if (!($video instanceof HTMLVideoElement)) {
                playerActions.error.call(this, new TypeError("config.$video \u4E0D\u662F HTMLVideoElement \u5B9E\u4F8B; " + Object.prototype.toString.call(config.$video)));
            }
            // video 元素 controls属性相关规则:
            // 1. 优先取决于配置项：controls=true ，video 增加 controls 属性；controls=false ，video 移除 controls 属性；
            // 2. 其次取决于 url search params：controls=0，移除 controls属性；
            // 3. 不满足以上情况，不做处理。
            var controls = typeof config.controls === 'undefined'
                ? parseUrlSearchParams(location.search).controls !== '0'
                : config.controls;
            if (controls) {
                $video.setAttribute('controls', 'controls');
            }
            else {
                $video.removeAttribute('controls');
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
                        _this.actions.setPlay.call(_this);
                        break;
                    }
                    case 'set-pause': {
                        _this.actions.setPause.call(_this);
                        break;
                    }
                    case 'set-muted': {
                        _this.actions.setMuted.call(_this, data.value);
                        break;
                    }
                    case 'set-presentation-mode': {
                        _this.actions.setPresentationMode.call(_this, data.value);
                        break;
                    }
                    case 'get-duration': {
                        _this.actions.getDuration.call(_this);
                        break;
                    }
                    case 'get-current-time': {
                        _this.actions.getCurrentTime.call(_this);
                        break;
                    }
                    case 'get-muted': {
                        _this.actions.getMuted.call(_this);
                        break;
                    }
                    case 'get-presentation-mode': {
                        _this.actions.getPresentationMode.call(_this);
                        break;
                    }
                }
            }, false);
        }
        IframePlayerProvider.prototype.postVideoMessage = function (data) {
            this.config.targetWindow.postMessage(data, '*');
        };
        return IframePlayerProvider;
    }());

    return IframePlayerProvider;

}());
