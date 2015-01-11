/*jslint browser: true */

(function () {
    "use strict";
    var proto;

    function Text(message, options) {

    }
    proto = Text.prototype;
    proto.message = '';
    proto.size = 16;
    proto.width = 0;
    proto.height = 16;
    proto.italic = false;
    proto.bold = false;
    proto.buffer = null;

    proto.createBuffer = function () {

    };
    proto.initialize = function (message, options) {

    };
    proto.destroy = function () {

    };
    proto.update = function (message, options) {
        this.destroy();
        this.initialize(message, options);
    };
    proto.render = function (x, y) {

    };

    window.Text = Text;
}());