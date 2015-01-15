/*jslint browser: true */
/*global Font */
(function () {
    "use strict";

    function load() {
        var f = new Font('arial', {scale: 2});
        document.body.appendChild(f.canvas);
    }

    window.addEventListener('load', load, false);
}());