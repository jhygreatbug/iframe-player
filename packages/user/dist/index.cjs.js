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

var REPLY_TIMEOUT = 200;
var modifiableConfig = [
    'autoPlay',
    'allowMutedAutoPlay',
    'timeout',
];
var replyEvents = [
    'reply-set-play',
    'reply-get-duration',
    'reply-get-current-time',
    'reply-get-muted',
    'reply-get-presentation-mode',
];
// todo
var messageEvents = [
    'can-play',
    'pause',
    'play',
    'ended',
    'time-update',
    'volume-change',
    'presentation-mode-changed',
    'error',
];
var defaultConfig = {
    autoPlay: false,
    allowMutedAutoPlay: false,
    controls: true
};
var getInitMap = function (keys) {
    var map = {};
    keys.forEach(function (key) {
        map[key] = [];
    });
    return map;
};
// todo: promise 泛型
function getAttr(instance, attr) {
    return new Promise(function (resolve) {
        // todo: 去掉as
        instance.iframePostMessage("get-" + attr);
        var timer = setTimeout(function () {
            resolve(void 0);
        }, REPLY_TIMEOUT);
        instance.waitQueueMap["reply-get-" + attr].push(function (data) {
            resolve(data);
            clearTimeout(timer);
        });
    });
}
function onMessage(instance, _a) {
    var refData = _a.data;
    var data = refData;
    if (typeof data === 'string') {
        try {
            data = JSON.parse(refData);
        }
        catch (_b) { }
    }
    // todo: 判断是哪个实例
    if (!isPlayerEventData(data)) {
        return;
    }
    var eventType = data.eventType;
    instance.consumer(eventType, data.value);
    instance.trigger(eventType, data.value);
}
// todo: url 中已有 controls 的情况处理
function UrlAddControls(url) {
    var _a = url.split('#'), prefix = _a[0], hash = _a[1];
    var _b = prefix.split('?'), path = _b[0], params = _b[1];
    if (params === null || params === void 0 ? void 0 : params.length) {
        return url.replace(params, params + '&controls=0');
    }
    else {
        return path + "?controls=0" + (hash ? "#" + hash : '');
    }
}
var IframePlayer = /** @class */ (function () {
    function IframePlayer(config) {
        var _this = this;
        this.config = __assign(__assign({}, defaultConfig), config);
        this.$iframe = config.target;
        this.waitQueueMap = getInitMap(replyEvents);
        this.eventHandlerMap = getInitMap(messageEvents);
        this.timers = {};
        this.beforePostHooks = [];
        this.onMessageHandler = function (ev) {
            onMessage(_this, ev);
        };
        window.addEventListener('message', this.onMessageHandler);
        var firstCanPlay = true;
        this.on('can-play', function () {
            if (!firstCanPlay) {
                return;
            }
            firstCanPlay = false;
            // can-play触发前配置可能被修改，所以在can-play触发后再判断
            if (_this.config.autoPlay) {
                // todo: 提供专门的自动播放方法
                _this.setPlay().then(function (_a) {
                    var resolved = _a.resolved;
                    if (resolved) {
                        return;
                    }
                    if (_this.config.allowMutedAutoPlay) {
                        _this.setMuted({ muted: true });
                        _this.setPlay();
                    }
                });
            }
        });
        if (this.config.controls === false) {
            this.config.playUrl = UrlAddControls(config.playUrl);
        }
        var timeout = this.config.timeout;
        if (typeof timeout === 'number' && timeout > 0) {
            var timer_1 = setTimeout(function () {
                _this.trigger('error', { message: 'timeout', code: 0 });
            }, timeout);
            this.timers[timer_1] = timer_1;
            this.on('can-play', function () {
                clearTimeout(timer_1);
                delete _this.timers[timer_1];
            });
        }
        this.$iframe.src = this.config.playUrl;
    }
    IframePlayer.prototype.beforePostMessage = function (hook) {
        this.beforePostHooks.push(hook);
    };
    IframePlayer.prototype.iframePostMessage = function (eventType, value) {
        var _this = this;
        var next = function (ev, v, hooksIndex) {
            var _a;
            if (hooksIndex === _this.beforePostHooks.length) {
                var data = { eventType: ev, value: v };
                if (_this.config.postStringMessage) {
                    data = JSON.stringify(data);
                }
                (_a = _this.$iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.postMessage(data, _this.config.playUrl);
                return;
            }
            var hook = _this.beforePostHooks[hooksIndex];
            hook === null || hook === void 0 ? void 0 : hook(ev, v, function (v) {
                next(ev, v, hooksIndex + 1);
            });
        };
        next(eventType, value, 0);
    };
    IframePlayer.prototype.setPlay = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.iframePostMessage('set-play');
            _this.iframePostMessage('play-video');
            var timer = setTimeout(function () {
                resolve({ resolved: false });
            }, REPLY_TIMEOUT);
            _this.waitQueueMap['reply-set-play'].push(function (data) {
                resolve(data);
                clearTimeout(timer);
            });
        });
    };
    IframePlayer.prototype.setPause = function () {
        this.iframePostMessage('set-pause');
        this.iframePostMessage('pause-video');
    };
    IframePlayer.prototype.setMuted = function (value) {
        this.iframePostMessage('set-muted', value);
    };
    IframePlayer.prototype.setPresentationMode = function (value) {
        this.iframePostMessage('set-presentation-mode', value);
    };
    IframePlayer.prototype.getDuration = function () {
        return getAttr(this, 'duration');
    };
    IframePlayer.prototype.getCurrentTime = function () {
        return getAttr(this, 'current-time');
    };
    IframePlayer.prototype.getMuted = function () {
        return getAttr(this, 'muted');
    };
    IframePlayer.prototype.getPresentationMode = function () {
        return getAttr(this, 'presentation-mode');
    };
    IframePlayer.prototype.consumer = function (eventType, value) {
        if (!(replyEvents.indexOf(eventType) >= 0)) {
            return;
        }
        var queue = this.waitQueueMap[eventType];
        var cb = queue.shift();
        if (cb) {
            cb(value);
        }
    };
    // todo: 更多限制
    IframePlayer.prototype.on = function (eventType, cb) {
        // eventType检查
        var map = this.eventHandlerMap;
        map[eventType].push(cb);
    };
    // todo: 更多限制
    IframePlayer.prototype.off = function (eventType, cb) {
        // eventType检查
        var map = this.eventHandlerMap;
        if (cb) {
            var index = map[eventType].indexOf(cb);
            if (index < 0) {
                return;
            }
            map[eventType].splice(index, 1);
        }
        else {
            map[eventType] = [];
        }
    };
    IframePlayer.prototype.trigger = function (eventType, value) {
        if (!(messageEvents.indexOf(eventType) >= 0)) {
            return;
        }
        var queue = this.eventHandlerMap[eventType];
        queue.forEach(function (cb) {
            cb(value);
        });
    };
    IframePlayer.prototype.setConfig = function (config) {
        for (var key in config) {
            // todo
            if (modifiableConfig.indexOf(key) >= 0) {
                this.config[key] = config[key];
            }
        }
    };
    IframePlayer.prototype.destroy = function () {
        window.removeEventListener('message', this.onMessageHandler);
        for (var timer in this.timers) {
            clearTimeout(timer);
        }
    };
    return IframePlayer;
}());

module.exports = IframePlayer;
