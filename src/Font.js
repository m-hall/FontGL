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
        this.events = {};

        this.createSheet();
        this.addChars(Font.defaultCharacters);
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

    /**
     * Updates the font's GL texture
     * @this   {Font}
     */
    proto.updateTexture = function () {
        var gl = this.gl,
            texture = this.texture,
            event;
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
        this.dispatch('update');
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
        this.dispatch('delete');
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
        this.dispatch('resize');
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
        ctx.font = this.fontSize * this.scale + "px " + this.family;
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.textBaseline = "top";
        this.spaceWidth = ctx.measureText(' ').width;
        this.canvas = canvas;
        this.ctx = ctx;
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
        if (this.sheetWidth === this.sheetHeight) {
            this.sheetWidth *= 2;
        } else {
            this.sheetHeight *= 2;
        }
        this.canvas.width = this.sheetWidth * this.scale;
        this.canvas.height = this.sheetHeight * this.scale;
        this.ctx.font = this.fontSize * this.scale + "px " + this.family;
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.textBaseline = "top";
        this.resetSheet(chars);
        this.dispatch('resize');
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
                return this.addCharacter(character);
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
    }
    /**
     * Resets the character sheet, optionally with extra characters
     * @this   {Font}
     * @param  {string} characters  A list of characters
     */
    proto.resetSheet = function (characters) {
        if (this.canvas) {
            this.ctx.clearRect(0, 0, this.sheetWidth, this.sheetHeight);
        } else {
            this.createSheet();
        }
        this.nextSheetX = 0;
        this.nextSheetY = 0;
        delete this.characterMap;
        this.characterMap = {};
        this.addChars(Font.defaultCharacters);
        if (characters) {
            this.addChars(characters);
        }
        this.updateTexture();
        this.dispatch('reset');
    };

    /**
     * Destroys the font object
     * @this   {Font}
     */
    proto.destroy = function () {
        this.deleteTexture();
        this.deleteSheet();
        this.dispatch('destroy');
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
     * Fires events to the listeners
     * @this   {Font}
     * @param  {string} name         Event name
     * @param  {object} [properties] An object with arbitrary properties.
     */
    proto.dispatch = function (name, properties) {
        var events = this.events[name],
            props = properties || {},
            i,
            l;
        if (!events) {
            return;
        }
        props.name = name;
        for (i = 0, l = events.length; i < l; i += 1) {
            events[i].call(this, props);
        }
    };
    /**
     * Adds a listener for an event on the Font object
     * @this   {Font}
     * @param  {string}   name     Event name
     * @param  {Callable} handler  An event listener
     */
    proto.listen = function (name, handler) {
        if (!this.events[name]) {
            this.events[name] = [];
        }
        this.events[name].push(handler);
    };
    /**
     * Removes a listener for an event on the Font object
     * @this   {Font}
     * @param  {string}   name     Event name
     * @param  {Callable} handler  An event listener
     */
    proto.unlisten = function (name, handler) {
        if (!this.events[name]) {
            return;
        }
        var i = this.events[name].indexOf(handler);
        if (i) {
            this.events[name].splice(i, 1);
        }
    };
    /**
     * Alias for unlisten
     */
    proto.ignore = proto.unlisten;

    window.Font = Font;
}());
