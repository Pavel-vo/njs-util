var util = {
    extend: function (dest) { // (Object[, Object, ...]) ->
        var sources = Array.prototype.slice.call(arguments, 1),
            i, j, len, src;

        for (j = 0, len = sources.length; j < len; j++) {
            src = sources[j] || {};
            for (i in src) {
                if (src.hasOwnProperty(i)) {
                    dest[i] = src[i];
                }
            }
        }
        return dest;
    },

    bind: function (fn, obj) { // (Function, Object) -> Function
        var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
        return function () {
            return fn.apply(obj, args || arguments);
        };
    },

    stamp: (function () {
        var lastId = 0,
            key = '_njs-util_id';
        return function (obj) {
            obj[key] = obj[key] || ++lastId;
            return obj[key];
        };
    }()),

    invokeEach: function (obj, method, context) {
        var i, args;

        if (typeof obj === 'object') {
            args = Array.prototype.slice.call(arguments, 3);

            for (i in obj) {
                method.apply(context, [i, obj[i]].concat(args));
            }
            return true;
        }

        return false;
    },

    limitExecByInterval: function (fn, time, context) {
        var lock, execOnUnlock;

        return function wrapperFn() {
            var args = arguments;

            if (lock) {
                execOnUnlock = true;
                return;
            }

            lock = true;

            setTimeout(function () {
                lock = false;

                if (execOnUnlock) {
                    wrapperFn.apply(context, args);
                    execOnUnlock = false;
                }
            }, time);

            fn.apply(context, args);
        };
    },

    falseFn: function () {
        return false;
    },

    formatNum: function (num, digits) {
        var pow = Math.pow(10, digits || 5);
        return Math.round(num * pow) / pow;
    },

    trim: function (str) {
        if (str) {
            return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
        }
    },

    splitWords: function (str) {
        return util.trim(str).split(/\s+/);
    },

    setOptions: function (obj, options) {
        obj.options = util.extend({}, obj.options, options);
        return obj.options;
    },

    getParamString: function (obj, existingUrl, uppercase) {
        var params = [];
        for (var i in obj) {
            params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
        }
        return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
    },
    template: function (str, data) {
        return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
            var value = data[key];
            if (value === undefined) {
                throw new Error('No value provided for variable ' + str);
            } else if (typeof value === 'function') {
                value = value(data);
            }
            return value;
        });
    },

    isArray: Array.isArray || function (obj) {
        return (Object.prototype.toString.call(obj) === '[object Array]');
    },

    emptyImageUrl: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',

    browser: function () {

        var ie = 'ActiveXObject' in window,
            ielt9 = ie && !document.addEventListener,

        // terrible browser detection to work around Safari / iOS / Android browser bugs
            ua = navigator.userAgent.toLowerCase(),
            webkit = ua.indexOf('webkit') !== -1,
            chrome = ua.indexOf('chrome') !== -1,
            phantomjs = ua.indexOf('phantom') !== -1,
            android = ua.indexOf('android') !== -1,
            android23 = ua.search('android [23]') !== -1,
            gecko = ua.indexOf('gecko') !== -1,

            mobile = typeof orientation !== undefined + '',
            msPointer = !window.PointerEvent && window.MSPointerEvent,
            pointer = (window.PointerEvent && window.navigator.pointerEnabled && window.navigator.maxTouchPoints) ||
                msPointer,
            retina = ('devicePixelRatio' in window && window.devicePixelRatio > 1) ||
                ('matchMedia' in window && window.matchMedia('(min-resolution:144dpi)') &&
                window.matchMedia('(min-resolution:144dpi)').matches),

            doc = document.documentElement,
            ie3d = ie && ('transition' in doc.style),
            webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23,
            gecko3d = 'MozPerspective' in doc.style,
            opera3d = 'OTransition' in doc.style,
            any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d || opera3d) && !phantomjs;

        var touch = !window.L_NO_TOUCH && !phantomjs && (pointer || 'ontouchstart' in window ||
            (window.DocumentTouch && document instanceof window.DocumentTouch));

        return {
            ie: ie,
            ielt9: ielt9,
            webkit: webkit,
            gecko: gecko && !webkit && !window.opera && !ie,

            android: android,
            android23: android23,

            chrome: chrome,

            ie3d: ie3d,
            webkit3d: webkit3d,
            gecko3d: gecko3d,
            opera3d: opera3d,
            any3d: any3d,

            mobile: mobile,
            mobileWebkit: mobile && webkit,
            mobileWebkit3d: mobile && webkit3d,
            mobileOpera: mobile && window.opera,

            touch: touch,
            msPointer: msPointer,
            pointer: pointer,

            retina: retina
        };

    },

    guid: function () {
        var s4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        };
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    },

    pad: function (num, size, symbol) {
        if (size == undefined)
            size = 5;
        if (symbol == undefined) {
            symbol = '0';
        }
        var s = num + '';
        while (s.length < size) s = symbol + s;
        return s;
    },

    createObjectSortByFieldFunction: function (parameters) {
        var sort = function (a, b) {
            if (parameters.inverse) {
                var c = a;
                a = b;
                b = c;
            }

            if (a[parameters.field] < b[parameters.field])
                return -1;
            if (a[parameters.field] > b[parameters.field])
                return 1;
            return 0;
        };
        return sort;
    },

    dataBytesRepresentation: function (input) {
        var units = ["Bytes", "Kb", "Mb", "Gb", "Tb", "Pb"];
        var i = 0;
        bytes = Number(input);
        for (i = 0; bytes > 1024; i++) {
            bytes /= 1024;
        }
        return {
            digit: (bytes) ? bytes.toFixed((i > 0) ? 2 : 0) : 0,
            unit: units[i]
        };
    },

    dataBytesRepresentationString: function (bytes) {
        var sizeRepr = util.dataBytesRepresentation(bytes);
        return sizeRepr.digit + ' ' + sizeRepr.unit;
    }

};

module.exports = util;
