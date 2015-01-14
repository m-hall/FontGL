/*jslint browser: true */
/*global Font */
(function () {
    "use strict";
    var woff2 = 'http://fonts.gstatic.com/s/opensans/v10/DXI1ORHCpsQm3Vp6mXoaTaOCaDZZVv73zpFSwE4Va2k.woff2',
        woff =  'http://fonts.gstatic.com/s/opensans/v10/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff',
        woffF = new Font('woff'),
        woff2F = new Font('woff2'),
        arialF = new Font('arial'),
        noUrlF = new Font('nourl'),
        timeoutF = new Font('timeout'),
        woffEl = document.getElementById('woff'),
        woff2El = document.getElementById('woff2'),
        arialEl = document.getElementById('arial'),
        noUrlEl = document.getElementById('nourl'),
        timeoutEl = document.getElementById('timeout');


    function success() {
        this.style.background = "#bfb";
    }
    function fail(reason) {
        this.innerHTML += " - " + reason;
        this.style.background = "#fbb";
    }
    woffF.load(woff, 'woff')
        .then(success.bind(woffEl), fail.bind(woffEl))
        .then(function () {
            return woff2F.load(woff2, 'woff2');
        })
        .then(success.bind(woff2El), fail.bind(woff2El))
        .then(function () {
            return arialF.load();
        })
        .then(success.bind(arialEl), fail.bind(arialEl))
        .then(function () {
            return noUrlF.load();
        })
        .then(success.bind(noUrlEl), fail.bind(noUrlEl))
        .then(function () {
            return timeoutF.load('fail');
        })
        .then(success.bind(timeoutEl), fail.bind(timeoutEl));
}());