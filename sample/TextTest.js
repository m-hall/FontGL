/*global Font, Text, FontFace, mat4 */
(function () {
    "use strict";
    var fonts = {},
        texts = [],
        initial = Date.now(),
        canvas,
        gl,
        perspective;

    function init() {
        canvas = document.createElement('canvas');
        canvas.style.width = "500px";
        canvas.style.height = "500px";
        canvas.width = 1000;
        canvas.height = 1000;
        document.body.appendChild(canvas);

        gl = canvas.getContext('webgl');
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.viewport(0, 0, 1000, 1000);
        perspective = mat4.create();
        mat4.ortho(perspective, 0, 500, 0, 500, 0, 1);
        window.gl = gl;
        Font.prototype.scale = window.devicePixelRatio || 1;
        Text.prototype.scale = window.devicePixelRatio || 1;
    }

    function renderFrame() {
        var delta = Date.now() - initial,
            text;
        text = texts[0];
        text.render(perspective);

        if (texts[1]) {
            text = texts[1];
            text.rotate(0, 0, delta * 0.001);
            text.render(perspective);
        }

        window.requestAnimationFrame(renderFrame);
        initial = Date.now();
    }

    function load() {
        var openSans = new FontFace('open sans', 'url("http://fonts.gstatic.com/s/opensans/v10/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff") format("woff")', {}),
            text;
        init();
        fonts['monospace'] = new Font('monospace', { gl: gl });
        text = new Text('monospace', fonts['monospace'], gl);
        text.translate(100, 100);
        texts.push(text);

        fonts['open sans'] = new Font(openSans, { gl: gl });
        openSans.load();
        fonts['open sans'].ready.then(function () {
            text = new Text('open sans', fonts['open sans'], gl);
            text.translate(100, 200);
            texts.push(text);
        });
        window.requestAnimationFrame(renderFrame);
    }

    window.addEventListener('load', load, false);
}());