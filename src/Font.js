/*jslint browser: true */

(function () {
    "use strict";
    var proto,
        formatRegexp = /\.(eot|ttf|woff|svg)($|\?|#)/,
        cssTemplate = '@font-face { font-family: "{family}"; src: {url}; }',
        testFont = 'monospace',
        testSize = '250px',
        testString = 'Quid pro quo',
        interval = 100,
        maxAttempts = 20,
        test,
        styleSheet = (function () {
            var style = document.createElement('style');
            style.appendChild(document.createTextNode(''));
            document.head.appendChild(style);
            return style.sheet;
        }());


    function isFontLoaded(family) {
        var testWidth,
            actualWidth;
        if (family === testFont) {
            return true;
        }
        if (!test) {
            test = document.createElement('span');
            test.innerHTML = testString;
            test.style.position = 'fixed';
            test.style.top = '-99999px';
            test.style.left = '-99999px';
            test.style.visibility = 'hidden';
            test.style.fontSize = testSize;
            test.style.fontFamily = testFont;
            document.body.appendChild(test);
        } else {
            test.style.fontFamily = testFont;
        }
        testWidth = test.offsetWidth;
        test.style.fontFamily = family + ',' + testFont;
        actualWidth = test.offsetWidth;
        return testWidth !== actualWidth;
    }

    function Font(name, options) {
        this.name = name;
        this.sheets = {};
        if (options) {
            if (options.glContext) {
                this.gl = options.glContext;
            }
        }
    }
    proto = Font.prototype;
    proto.loaded = false;
    proto.url = '';
    proto.format = '';
    proto.load = function (url, format) {
        var src = url || this.url,
            type = format || this.format,
            self = this,
            family = this.name,
            match,
            fontRule;
        if (isFontLoaded(family)) {
            return Promise.resolve('Yay!');
        }
        if (!src) {
            return Promise.reject('No source URL');
        }
        if (!type) {
            match = url.match(formatRegexp);
            if (match && match[1]) {
                type = match[1];
            }
        }
        this.format = type;
        fontRule = cssTemplate.replace('{family}', family);
        fontRule = fontRule.replace('{url}', 'url(' + src + ') format("' + type + '")');
        styleSheet.insertRule(fontRule, 0);
        return new Promise(function (resolve, reject) {
            if (isFontLoaded(family)) {
                resolve();
            }
            var timer, times = 0;
            timer = setInterval(function () {
                times++;
                if (isFontLoaded(family)) {
                    clearInterval(timer);
                    self.loaded = true;
                    resolve();
                } else if (times > maxAttempts) {
                    clearInterval(timer);
                    reject("Timed out.");
                }
            }, interval);
        });
    };
    proto.unload = function () {

    };
    proto.addCharacters = function (chars) {

    };

    window.Font = Font;
}());