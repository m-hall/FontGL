# FontGL
Renders fonts into WebGL context.

## Features
* Font Face loading
* GL Text rendering
* Font atlas


## Usage

### FontFace
Loads a WebFont for use with an application.

#### Example
```JavaScript
var face = new FontFace('family', 'url("http://src.url/font.woff") format("woff")');
face.load()
  .then(success, error);
```

### Font
Creates a texture for rendering font to GL.

#### Example
```JavaScript
var font = new Font('family', {gl : glContext});
font.ready.then(success, error);
```

### Text
Renders a string to GL.

```JavaScript
var text = new Text('message', font, gl);
text.render(perspectiveMatrix, modelViewMatrix);
```

## Resources
* [toji/gl-matrix](https://github.com/toji/gl-matrix) - Required for text rendering.
