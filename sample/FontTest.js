/*jslint browser: true */
/*global Font */
(function () {
    "use strict";

    function log() {
        console.log(this, arguments);
    }
    function load() {
        var f = new Font('arial', {scale: 2});
        document.body.appendChild(f.canvas);
        f = new Font('times', {scale: 2});
        document.body.appendChild(f.canvas);
        f = new Font('monospace', { scale: 2 });
        f.listen('resize', log);
        f.listen('update', log);
        document.body.appendChild(f.canvas);
        f.addCharacters('~!@#$%^&*()_+{}|:"<>?`,./;\'[]\\-="');
    }

    window.addEventListener('load', load, false);
}());