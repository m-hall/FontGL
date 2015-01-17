/*jslint browser: true */
/*global Font */
(function () {
    "use strict";

    function load() {
        var openSans = new FontFace('open sans', 'url("http://fonts.gstatic.com/s/opensans/v10/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff") format("woff")', {});
        var f = new Font('monospace');
        document.body.appendChild(f.canvas);
        f.addCharacters('~!@#$%^&*()_+{}|:"<>?`,./;\'[]\\-="Éá, é, í, ó, ú, ü, ñ ...…');
        f = new Font('arial');
        document.body.appendChild(f.canvas);


        f = new Font(openSans);
        openSans.loaded.then(function () {
            document.body.appendChild(f.canvas);
            f.addCharacters('~!@#$%^&*()_+{}|:"<>?`,./;\'[]\\-="Éá, é, í, ó, ú, ü, ñ ...…');
        });
    }

    window.addEventListener('load', load, false);
}());