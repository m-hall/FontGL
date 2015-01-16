# FontGL
Renders fonts into WebGL context.

## Features
* Font loading
* Text rendering


## Usage

### FontFace
```JavaScript
var face = new FontFace('family', 'url("http://src.url/font.woff") format("woff")');
face.load()
  .then(success, error);
```

### Font
```JavaScript
var font = new Font('family');
font.setGL(glContext);
```

### Text
```JavaScript
var text = new Text('message', font, gl);
text.render(perspectiveMatrix, modelViewMatrix);
```

## Resources
* [toji/gl-matrix](https://github.com/toji/gl-matrix) - Used for the samples.
