/*jslint browser: true */
/*global Font, Text, FontFace, mat4 */
(function () {
    "use strict";
    var fonts = {},
        texts = [],
        initial = Date.now(),
        rotation = [0, 0, 1],
        canvas,
        gl,
        perspective,
        modelView;

    function init() {
        canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        canvas.style.width = "500px";
        canvas.style.height = "500px";
        canvas.width = 1000;
        canvas.height = 1000;
        gl.viewport(0, 0, 1000, 1000);
        perspective = mat4.create();
        mat4.ortho(perspective, 0, 500, 0, 500, 0, 1);
        modelView = mat4.create();
        Font.prototype.scale = window.devicePixelRatio || 1;
        Text.prototype.scale = window.devicePixelRatio || 1;
    }

    function renderFrame() {
        var delta = Date.now() - initial, i, l;
        mat4.identity(modelView);
        mat4.translate(modelView, modelView, [100, 100, 0]);
        texts[0].render(perspective, modelView);

        if (texts[1]) {
            mat4.translate(modelView, modelView, [texts[1].width / 2, 100 + texts[1].height / 2, 0]);
            mat4.rotate(modelView, modelView, delta * 0.0005, rotation);
            mat4.translate(modelView, modelView, [-texts[1].width / 2, -texts[1].height / 2, 0]);
            texts[1].render(perspective, modelView);
        }

        window.requestAnimationFrame(renderFrame);
    }

    function load() {
        init();
        fonts['monospace'] = new Font('monospace', { gl: gl });
        texts.push(new Text('monospace', fonts['monospace'], gl));
        new FontFace('open sans', 'url("http://fonts.gstatic.com/s/opensans/v10/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff") format("woff")', {})
            .load()
            .then(function () {
                fonts['open sans'] = new Font('open sans', { gl: gl });

                texts.push(new Text('open sans', fonts['open sans'], gl));
            });
        window.requestAnimationFrame(renderFrame);
    }

    window.addEventListener('load', load, false);
}());