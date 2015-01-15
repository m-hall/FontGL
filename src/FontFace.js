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

    /**
     * Checks if a font is loaded
     * Note: can have false negative if font is same size as monospace font.
     * @param  {string}  family  The name of a font family.
     * @return {Boolean}         True if the font is loaded, false otherwise.
     */
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

    /**
     * Watches a font to see if it loads
     * @param  {FontFace} font  A FontFace object that is loading
     */
    function watchFont(font) {
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
        }.bind(font), interval);
    }

    /**
     * Creates a new FontFace object
     * @constructor
     * @param {string} family    The name of a font family.
     * @param {string} src       The css src attribute of a font family.
     * @param {Object} [options] Extra options to define the font.
     */
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

    /**
     * Gets the promise that fulfills when the FontFace finishes loading
     * @this {FontFace}
     * @property {Promise} loaded  A promise object for loading the font
     */
    Object.defineProperty(
        proto,
        'loaded',
        {
            get: function () {
                return this._promise;
            }
        }
    );

    /**
     * Starts loading the FontFace
     * @this {FontFace}
     * @return {Promise}  A promise that will be fulfilled when the font finishes loading.
     */
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