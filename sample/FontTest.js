/*jslint browser: true */
/*global Font */
(function () {
    "use strict";

    function log() {
        console.log(this, arguments);
    }
    function load() {
        var f = new Font('monospace');
        f.listen('resize', log);
        f.listen('update', log);
        document.body.appendChild(f.canvas);
        f.addCharacters('~!@#$%^&*()_+{}|:"<>?`,./;\'[]\\-="Éá, é, í, ó, ú, ü, ñ ...…');
        f = new Font('arial');
        document.body.appendChild(f.canvas);
        new FontFace('open sans', 'url(http://fonts.gstatic.com/s/opensans/v10/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff) format(woff)', {})
            .load()
            .then(function () {
                f = new Font('open sans');
                f.listen('resize', log);
                f.listen('update', log);
                document.body.appendChild(f.canvas);
                f.addCharacters('~!@#$%^&*()_+{}|:"<>?`,./;\'[]\\-="Éá, é, í, ó, ú, ü, ñ ...…');
            });
    }

    window.addEventListener('load', load, false);
}());