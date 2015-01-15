/*jslint browser: true */

(function () {
    "use strict";
    var proto;

    function Font(name, options) {
        this.name = name;
        this.sheets = {};
        if (options) {
            if (options.glContext) {
                this.gl = options.glContext;
            }
        }
    }
    Font.defaultCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.,\'-\/';
    proto = Font.prototype;
    proto.delete = function () {

    };
    proto.addCharacters = function (chars) {

    };

    window.Font = Font;
}());