/*jslint browser: true */
/*global Font */
(function () {
    "use strict";
    var woff = 'http://fonts.gstatic.com/s/opensans/v10/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff',
        woff2 = 'http://fonts.gstatic.com/s/opensans/v10/DXI1ORHCpsQm3Vp6mXoaTaOCaDZZVv73zpFSwE4Va2k.woff2';

    function success() {
        this.style.background = "#bfb";
    }
    function fail(reason) {
        this.innerHTML += " - " + reason;
        this.style.background = "#fbb";
    }
    function addLoadTest(name, url, format) {
        var el = document.createElement('div'),
            font = new Font(name);

        el.style.fontSize = '30px';
        el.style.fontFamily = '"' + name + '", monospace';
        el.innerHTML = name;
        document.body.appendChild(el);

        font.load(url, format)
            .then(success.bind(el), fail.bind(el));
    }
    function load() {
        addLoadTest('woff', woff, 'woff');
        addLoadTest('woff2', woff2, 'woff2');
        addLoadTest('arial');
        addLoadTest('nourl');
        addLoadTest('timeout', 'doesn\'t exist');
        addLoadTest('dontBreak', 'special characters don\'t break `~!@#$%^&*()_+-={}|[]\\;\";,./<>?1234567890');
    }

    window.addEventListener('load', load, false);
}());