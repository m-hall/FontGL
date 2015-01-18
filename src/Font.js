/*jslint browser: true */

(function () {
    "use strict";
    var proto,
        spaces = /\s/gm,
        characterSpacing = 1; // in pixels

    /**
     * Font class for GL text rendering
     * @param {string} family    Font family name
     * @param {Object} [options] Optional properties for the Font object.
     */
    function Font(family, options) {
        var self = this;
        if (options) {
            if (options.gl) {
                this.gl = options.gl;
            }
            if (!isNaN(options.scale) && options.scale > 0) {
                this.scale = options.scale;
            }
            if (!isNaN(options.size) && options.size > 0) {
                this.size = options.size;
            }
            if (!isNaN(options.lineSize) && options.lineSize > 0) {
                this.lineSize = options.lineSize;
            }
            if (options.characters) {
                this.characters = "" + options.characters;
            }
        }

        this._promise = new Promise(function (resolve, reject) {
            self._resolve = resolve;
            self._reject = reject;
        });

        this.characterMap = {};

        if (family instanceof FontFace) {
            this.family = family.family;
            this.fontFace = family;
            family.load().then(
                function () {
                    self.fontLoaded();
                },
                function () {
                    self._reject();
                }
            );
        } else if (typeof family === 'string' && FontFace.isLoaded(family)) {
            this.family = family;
            this.fontLoaded();
        } else {
            this._reject();
        }
    }
    Font.defaultCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.,\'-\/';
    proto = Font.prototype;

    proto.size = 30;
    proto.scale = 1;
    proto.lineSize = 1.3; // size relative to EMs

    proto.sheetWidth = 256;
    proto.sheetHeight = 256;
    proto.nextSheetX = 0;
    proto.nextSheetY = 0;
    proto.characters = Font.defaultCharacters;

    /**
     * Gets the promise that fulfills when the FontFace finishes loading
     * @this {FontFace}
     * @property {Promise} loaded  A promise object for loading the font
     */
    Object.defineProperty(
        proto,
        'ready',
        {
            get: function () {
                return this._promise;
            }
        }
    );

    /**
     * Handles the Font Face when it has loaded
     */
    proto.fontLoaded = function () {
        this.createSheet();
        this.addChars(this.characters);
        if (this.gl) {
            this.updateTexture();
        }
    };

    /**
     * Updates the font's GL texture
     * @this   {Font}
     */
    proto.updateTexture = function () {
        var gl = this.gl,
            texture = this.texture;
        if (!gl) {
            return false;
        }
        if (texture) {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
        } else {
            texture = this.gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
            this.texture = texture;
            this._resolve();
        }
    };
    /**
     * Deletes the font's GL texture
     * @this   {Font}
     */
    proto.deleteTexture = function () {
        if (this.texture) {
            this.gl.deleteTexture(this.texture);
            delete this.texture;
        }
    };
    /**
     * Sets the GL context
     * @this   {Font}
     * @param  {WebGLContext} gl  An active WebGLContext Object
     */
    proto.setGL = function (gl) {
        this.deleteTexture();
        this.gl = gl;
        this.updateTexture();
    };
    /**
     * Creates the canvas sheet
     * @this   {Font}
     */
    proto.createSheet = function () {
        if (this.canvas && this.ctx) {
            return;
        }
        var canvas = document.createElement('canvas'),
            ctx;
        canvas.width = this.sheetWidth * this.scale;
        canvas.height = this.sheetHeight * this.scale;
        ctx = canvas.getContext('2d');
        ctx.font = this.size * this.scale + "px " + this.family;
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.textBaseline = "top";
        this.spaceWidth = ctx.measureText(' ').width;
        this.canvas = canvas;
        this.ctx = ctx;
        this.characterMap[' '] = {
            width: this.spaceWidth,
            height: this.size * this.lineSize,
            textureCoords: null
        };
    };
    /**
     * Deletes the canvas sheet
     * @this   {Font}
     */
    proto.deleteSheet = function () {
        this.canvas.width = 1;
        this.canvas.height = 1;
        delete this.ctx;
        delete this.canvas;
    };
    /**
     * Makes the canvas sheet bigger
     * @this   {Font}
     */
    proto.biggerSheet = function () {
        var chars = Object.keys(this.characterMap).join('');
        this.sheetHeight *= 2;
        this.canvas.width = this.sheetWidth * this.scale;
        this.canvas.height = this.sheetHeight * this.scale;
        this.ctx.font = this.size * this.scale + "px " + this.family;
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.textBaseline = "top";
        this.resetSheet(chars);
    };
    /**
     * Adds a single character to the font sheet
     * @this   {Font}
     * @param  {char} character  A single character
     * @return {boolean}        True if the character was added to the sheet, false otherwise.
     */
    proto.addCharacter = function (character) {
        if (this.characterMap[character]) {
            return false;
        }
        var ctx = this.ctx,
            scale = this.scale,
            w = this.ctx.measureText(character).width,
            h = this.size * scale * this.lineSize,
            x = this.nextSheetX,
            y = this.nextSheetY;
        if (x + w > this.canvas.width) {
            x = 0;
            y += h + characterSpacing;
            if (y + h > this.canvas.height) {
                this.biggerSheet();
                return this.addCharacter(character);
            }
        }
        this.characterMap[character] = {
            width: w / scale - characterSpacing,
            height: h / scale - characterSpacing,
            textureCoords: {
                x: x / this.canvas.width,
                y: 1 - (y + h) / this.canvas.height,
                width: w / this.canvas.width,
                height: h / this.canvas.height
            }
        };
        this.characters += character;
        ctx.fillText(character, x, y);
        x += w + characterSpacing;
        this.nextSheetY = y;
        this.nextSheetX = x;
        return true;
    };
    /**
     * Adds a list of characters to the Font sheet
     * @this   {Font}
     * @param  {string} characters  A list of characters
     */
    proto.addChars = function (characters) {
        var chars = characters.replace(spaces, '').split(''),
            changed = false,
            i,
            l;
        for (i = 0, l = chars.length; i < l; i += 1) {
            changed |= this.addCharacter(chars[i]);
        }
        return changed;
    };
    /**
     * Adds a list of characters to the Font sheet and updates the texture if successful
     * @this   {Font}
     * @param  {string} characters  A list of characters
     */
    proto.addCharacters = function (characters) {
        if (this.addChars(characters) && this.gl) {
            this.updateTexture();
        }
    };
    /**
     * Resets the character sheet, optionally with extra characters
     * @this   {Font}
     */
    proto.resetSheet = function () {
        if (this.canvas) {
            this.ctx.clearRect(0, 0, this.sheetWidth, this.sheetHeight);
        } else {
            this.createSheet();
        }
        this.nextSheetX = 0;
        this.nextSheetY = 0;
        delete this.characterMap;
        this.characterMap = {
            ' ': {
                width: this.spaceWidth,
                height: this.size * this.lineSize,
                textureCoords: null
            }
        };
        this.addChars(this.characters);
        this.updateTexture();
    };

    /**
     * Gets the character object for a character
     * @param  {char} character  Gets a character from the sheet
     * @return {Object}          An object with width, height and textureCoords
     */
    proto.getCharacter = function (character) {
        this.addCharacter(character);
        return this.characterMap[character];
    };

    /**
     * Destroys the font object
     * @this   {Font}
     */
    proto.destroy = function () {
        this.deleteTexture();
        this.deleteSheet();
    };
    /**
     * Checks if the Font is ready to be rendered to GL
     * @this   {Font}
     * @return {Boolean}  True if the texture is available, false otherwise.
     */
    proto.isReady = function () {
        return this.sheet && this.texture;
    };
    /**
     * Measures the width of a text string
     * @param  {string} text  A string
     * @return {int}          The width of the string
     */
    proto.textWidth = function (text) {
        if (Font.canvas && Font.ctx) {
            return false;
        }
        var chars = text.split(''),
            w = 0,
            i,
            l;
        for (i = 0, l = chars.length; i < l; i += 1) {
            w += this.getCharacter(chars[i]).width;
        }
        return w;
    };

    window.Font = Font;
}());
