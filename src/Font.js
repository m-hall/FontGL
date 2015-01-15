/*jslint browser: true */

(function () {
    "use strict";
    var proto,
        spaces = /\s/gm,
        characterSpacing = 1; // in pixels

    function Font(family, options) {
        this.family = family;
        this.sheets = {};
        if (options) {
            if (options.gl) {
                this.gl = options.gl;
            }
            if (!isNaN(options.scale) && options.scale > 0) {
                this.scale = options.scale;
            }
            if (!isNaN(options.fontSize) && options.fontSize > 0) {
                this.fontSize = options.fontSize;
            }
            if (!isNaN(options.lineSize) && options.lineSize > 0) {
                this.lineSize = options.lineSize;
            }
        }

        this.characterMap = {};
        this.createSheet();
        this.addCharacters(Font.defaultCharacters);
        if (this.gl) {
            this.updateTexture();
        }
    }
    Font.defaultCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.,\'-\/';
    Font.flipTextures = false;
    proto = Font.prototype;

    proto.fontSize = 30;
    proto.scale = 1;
    proto.lineSize = 1.1; // size relative to EMs

    proto.sheetWidth = 256;
    proto.sheetHeight = 256;
    proto.nextSheetX = 0;
    proto.nextSheetY = 0;
    proto.updateTexture = function () {
        var gl = this.gl,
            texture = this.texture;
        if (!gl) {
            return false;
        }
        if (texture) {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            if (Font.flipTextures) {
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            }
            gl.texImage2D(gl.TEXTURE_2D, 9, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
        } else {
            texture = this.gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            if (Font.flipTextures) {
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            }
            gl.texImage2D(gl.TEXTURE_2D, 9, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
            this.texture = texture;
        }
    };
    proto.deleteTexture = function () {
        if (this.texture) {
            this.gl.deleteTexture(this.texture);
            delete this.texture;
        }
    };
    proto.setGL = function (gl) {
        this.deleteTexture();
        this.gl = gl;
        this.updateTexture();
    };
    proto.createSheet = function () {
        if (this.canvas && this.ctx) {
            return;
        }
        var canvas = document.createElement('canvas'),
            ctx;
        canvas.width = this.sheetWidth * this.scale;
        canvas.height = this.sheetHeight * this.scale;
        canvas.style.background = "rgb(153, 135, 255)";
        ctx = canvas.getContext('2d');
        ctx.font = this.fontSize * this.scale + "px " + this.family;
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.textBaseline = "top";
        this.spaceWidth = ctx.measureText(' ').width;
        this.canvas = canvas;
        this.ctx = ctx;
    };
    proto.deleteSheet = function () {
        this.canvas.width = 1;
        this.canvas.height = 1;
        delete this.ctx;
        delete this.canvas;
    };
    proto.biggerSheet = function () {
        var chars = Object.keys(this.characterMap).join('');
        if (sheetWidth === sheetHeight) {
            sheetWidth *= 2;
        } else {
            sheetHeight *= 2;
        }
        this.canvas.width = sheetWidth;
        this.canvas.height = sheetHeight;
        ctx.clearRect(0, 0, sheetWidth, sheetHeight);
    };
    proto.addCharacter = function (character) {
        if (this.characterMap[character]) {
            return;
        }
        var ctx = this.ctx,
            w = this.ctx.measureText(character).width,
            vw = w / this.canvas.width,
            h = this.fontSize * this.scale * this.lineSize,
            vh = h / this.canvas.width,
            x = this.nextSheetX,
            y = this.nextSheetY;
        if (x + w > this.canvas.width) {
            x = 0;
            y += h + characterSpacing;
            if (y + h > this.canvas.height) {
                this.biggerSheet();
            }
        }
        this.characterMap[character] = [
            x, y,
            x, vh,
            vw, y,
            vw, vh
        ];
        ctx.fillText(character, x, y);
        x += w + characterSpacing;
        this.nextSheetY = y;
        this.nextSheetX = x;
    };
    proto.addCharacters = function (characters) {
        var chars = characters.replace(spaces, '').split(''),
            i,
            l;
        for (i = 0, l = chars.length; i < l; i += 1) {
            this.addCharacter(chars[i]);
        }
    };
    proto.resetSheet = function (characters) {
        this.deleteSheet();
        delete this.characters;
        this.createSheet();
        this.addCharacters(Font.defaultCharacters);
        if (characters) {
            this.addCharacters(characters);
        }
        this.updateTexture();
    };
    proto.destroy = function () {
        this.deleteTexture();
        this.deleteSheet();
    };
    proto.isReady = function () {
        return this.sheet && this.texture;
    };

    window.Font = Font;
}());
