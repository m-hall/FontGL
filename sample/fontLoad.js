/*jslint browser: true */
/*global Font */
(function () {
    "use strict";
    var font = 'http://fonts.gstatic.com/s/opensans/v10/DXI1ORHCpsQm3Vp6mXoaTaOCaDZZVv73zpFSwE4Va2k.woff2',
        format = 'woff2',
        f = new Font('test'),
        f2 = new Font('meep'),
        testEl = document.getElementById('test'),
        failEl = document.getElementById('fail');


    function success() {
        this.style.background = "#bfb";
    }
    function fail(reason) {
        this.innerHTML += " - " + reason;
        this.style.background = "#fbb";
    }
    f.load(font, format)
        .then(success.bind(testEl), fail.bind(testEl))
        .then(function () {
            return f2.load('fail');
        })
        .then(success.bind(failEl), fail.bind(failEl));
}());