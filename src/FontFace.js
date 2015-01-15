/*jslint browser: true, nomen: true */
(function () {
    'use strict';

    /*if (window.FontFace) {
        return;
    }*/
    var proto,
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

    function watchFont(self) {
        var timer,
            times = 0;
        timer = setInterval(function () {
            times += 1;
            if (isFontLoaded(this.family)) {
                clearInterval(timer);
                this.status = "loaded";
                this._resolve();
            } else if (times > maxAttempts) {
                clearInterval(timer);
                this.status = "error";
                this._reject("Timed out.");
            }
        }.bind(self), interval);
    }

    function FontFace(family, src, options) {
        var self = this;
        this.family = family;
        this.src = src;
        this._promise = new Promise(function (resolve, reject) {
            self._resolve = resolve;
            self._reject = reject;
        });
        this.options = options;
    }
    proto = FontFace.prototype;
    proto.featureSettings = "normal";
    proto.status = "unloaded";
    proto.stretch = "normal";
    proto.style = "normal";
    proto.unicodeRange = "U+0-10FFFF";
    proto.variant = "normal";
    proto.weight = "normal";
    Object.defineProperty(
        proto,
        'loaded',
        {
            get: function () {
                return this._promise;
            }
        }
    );

    proto.load = function () {
        if (this.status !== "unloaded") {
            return this._promise();
        }
        var family = this.family,
            src = this.src,
            fontRule;
        if (isFontLoaded(family)) {
            this.status = "loaded";
            this._resolve();
            return this._promise;
        }
        if (!src) {
            this.status = "error";
            this._reject('No source URL');
            return this._promise;
        }
        fontRule = cssTemplate.replace('{family}', family);
        fontRule = fontRule.replace('{url}', src);
        styleSheet.insertRule(fontRule, 0);
        watchFont(this);
        this.status = "loading";
        return this._promise;
    };

    window.FontFace = FontFace;
}());