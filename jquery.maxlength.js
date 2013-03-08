/**
 * 修正 IE9- 的正则 split 问题
 *
 * @link http://blog.stevenlevithan.com/archives/cross-browser-split
 */
(function() {
    var split;
    // Avoid running twice; that would break the `nativeSplit` reference
    split = split || function (undef) {

        var nativeSplit = String.prototype.split,
            compliantExecNpcg = /()??/.exec("")[1] === undef, // NPCG: nonparticipating capturing group
            self;

        self = function (str, separator, limit) {
            // If `separator` is not a regex, use `nativeSplit`
            if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
                return nativeSplit.call(str, separator, limit);
            }
            var output = [],
                flags = (separator.ignoreCase ? "i" : "") +
                    (separator.multiline ? "m" : "") +
                    (separator.extended ? "x" : "") + // Proposed for ES6
                    (separator.sticky ? "y" : ""), // Firefox 3+
                lastLastIndex = 0,
                // Make `global` and avoid `lastIndex` issues by working with a copy
                separator = new RegExp(separator.source, flags + "g"),
                separator2, match, lastIndex, lastLength;
            str += ""; // Type-convert
            if (!compliantExecNpcg) {
                // Doesn't need flags gy, but they don't hurt
                separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
            }
            /* Values for `limit`, per the spec:
             * If undefined: 4294967295 // Math.pow(2, 32) - 1
             * If 0, Infinity, or NaN: 0
             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
             * If negative number: 4294967296 - Math.floor(Math.abs(limit))
             * If other: Type-convert, then use the above rules
             */
            limit = limit === undef ?
                -1 >>> 0 : // Math.pow(2, 32) - 1
                limit >>> 0; // ToUint32(limit)
            while (match = separator.exec(str)) {
                // `separator.lastIndex` is not reliable cross-browser
                lastIndex = match.index + match[0].length;
                if (lastIndex > lastLastIndex) {
                    output.push(str.slice(lastLastIndex, match.index));
                    // Fix browsers whose `exec` methods don't consistently return `undefined` for
                    // nonparticipating capturing groups
                    if (!compliantExecNpcg && match.length > 1) {
                        match[0].replace(separator2, function () {
                            for (var i = 1; i < arguments.length - 2; i++) {
                                if (arguments[i] === undef) {
                                    match[i] = undef;
                                }
                            }
                        });
                    }
                    if (match.length > 1 && match.index < str.length) {
                        Array.prototype.push.apply(output, match.slice(1));
                    }
                    lastLength = match[0].length;
                    lastLastIndex = lastIndex;
                    if (output.length >= limit) {
                        break;
                    }
                }
                if (separator.lastIndex === match.index) {
                    separator.lastIndex++; // Avoid an infinite loop
                }
            }
            if (lastLastIndex === str.length) {
                if (lastLength || !separator.test("")) {
                    output.push("");
                }
            } else {
                output.push(str.slice(lastLastIndex));
            }
            return output.length > limit ? output.slice(0, limit) : output;
        };

        // For convenience
        String.prototype.split = function (separator, limit) {
            return self(this, separator, limit);
        };

        return self;
    }();
})();

/**
 * 最大长度计算显示插件
 *
 * @author    micate {@link http://micate.me}
 * @homepage  @github {@link http://github.com/micate/maxLength}
 * @depends   jQuery 1.3.2+
 * @version   $Id$
 */
(function($) {

    var funcs = {
        1: {
            length: function(val) {
                return (val + '').length;
            },
            substr: function(val, length) {
                return (val + '').substr(0, length);
            }
        },
        2: {
            length: function(val) {
                return (val + '').replace(/[^\x00-\xff]/gm, '__').length;
            },
            substr: function(val, length) {
                var parts = (val + '').split(''), part, result = '', current = 0;
                while (part = parts.shift()) {
                    if (part.match(/[\x00-\xff]/)) { // 英文
                        if ((current + 1) > length) {
                            return result;
                        }
                        current += 1;
                    } else { // 中文
                        if ((current + 2) > length) {
                            return result;
                        }
                        current += 2;
                    }
                    result += part;
                }
                return result;
            }
        },
        3: {
            length: function(val) {
                return Math.ceil((val + '').replace(/[^\x00-\xff]/gm, '__').length / 2);
            },
            substr: function(val, length) {
                var parts = (val + '').split(''), part, result = '', current = 0;
                while (part = parts.shift()) {
                    if (part.match(/[\x00-\xff]/)) { // 英文
                        if ((current + 0.5) > length) {
                            return result;
                        }
                        current += 0.5;
                    } else { // 中文
                        if ((current + 1) > length) {
                            return result;
                        }
                        current += 1;
                    }
                    result += part;
                }
                return result;
            }
        }
    };

    var toString = Object.prototype.toString;

    function isString(obj) {
        return toString.call(obj) == '[object String]';
    }

    $.fn.maxLength = function(options) {

        return this.each(function() {
            var opt = $.extend({}, DEFAULTS, options),
                elem = $(this),
                func = funcs[opt.mode];

            if (isString(opt.limit)) {
                opt.limit = parseInt(elem.attr(opt.limit));
            }

            if (opt.display && !$.isFunction(opt.display)) {
                opt.display = opt.display.jquery ? opt.display : $(opt.display);
                if (!opt.display.length) {
                    opt.display = null;
                }
            }

            function updateTips(length, error) {
                if (opt.limit && opt.count == $.fn.maxLength.COUNT_LEFT) {
                    length = opt.limit - length;
                }
                if ($.isFunction(opt.display)) {
                    opt.display.apply(elem, [length, error]);
                } else {
                    if (!opt.display) {
                        opt.display = $('<span class="maxlength"></span>').insertAfter(elem);
                    }
                    opt.display.text(length);
                    opt.display[error ? 'addClass' : 'removeClass']('maxlength-error');
                }
            }

            function limitUpdate() {
                var value = elem.val(),
                    length = func.length(value);
                if (opt.prevent && length > opt.limit) {
                    elem.val(func.substr(value, opt.limit));
                    length = opt.limit;
                }
                updateTips(length, false);
            }

            // 阻止掉非输入法模式下的超出操作
            opt.prevent && opt.limit && elem.bind('keydown', function(ev) {
                var value = elem.val(),
                    code = ev.keyCode;
                if (func.length(value) >= opt.limit) {
                    if ((code >= 65 && code <= 90 && !(ev.ctrlKey || ev.metaKey)) // a-z
                        || (code >= 48 && code <= 57) // 0-9
                        || $.inArray(code, [192, 173, 61, 219, 220, 221, 222, 59, 188, 190, 191]) > -1) { // other input
                        ev.preventDefault();
                    }
                }
            });

            // 输入、粘贴或改变
            // 由于中文输入法的问题，放弃 propertychange input
            // 监听 change 以便外部手动触发改变
            elem.bind('paste keyup change', function() {
                setTimeout(function() {
                    limitUpdate();
                }, 0);
            });

            updateTips(func.length(elem.val()));
        });
    };

    $.fn.maxLength.MODE_NORMAL = 1;  // 任何一个字符都算一个长度
    $.fn.maxLength.MODE_MAXIMUM = 2; // 一个英文算一个，一个中文算两个
    $.fn.maxLength.MODE_CHINESE = 3; // 一个中文算一个，两个英文算一个

    $.fn.maxLength.COUNT_LENGTH = 1; // 显示输入长度
    $.fn.maxLength.COUNT_LEFT = 2;   // 显示可输入长度

    $.fn.maxLength.NOOP = function() {};

    var DEFAULTS = {
        limit: 0,                           // 长度限制
        prevent: true,                      // 阻止继续输入
        count: $.fn.maxLength.COUNT_LENGTH, // 计数显示方式
        display: null,                      // 显示提示信息回调或元素
        mode: $.fn.maxLength.MODE_CHINESE   // 长度计算方式
    };

})(jQuery);