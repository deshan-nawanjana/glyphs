## Glyphs : SVG Icons Library for UI Development

Glyph is an SVG element handling module for web application development. Also a collection of icon packs. Explore and download 18,000+ SVG icons.

### Glyph Introduction

By defining or importing svg file or JSON content, Glyph is able to handle the dom element to add styles, transformations, animations. Also able to convert the SVG into high resolution PNG images.

```JavaScript
// create by element
const glyph_1 = new Glyph(document.querySelector('svg'))

// create by string
const glyph_2 = new Glyph('<svg>...</svg>')

// create by json content
const glyph_3 = new Glyph({ viewBox, elements })
```

You can also load the SVG from url

```JavaScript
new Glyph().load('my-icon.svg').then(() => {
    // glyph is loaded
})
```

### Append Element and Update

You can append the dom element if you create the Glyph using string content, loading method or JSON content. This element will be updated in the future with any Glyph method. 

```JavaScript
const glyph = new Glyph().load('my-icon.svg').then(() => {
    document.body.appendChild(glyph.domElement)
})
```

## Resize SVG Element

Glyph calculate the dimensions for SVG element using it's viewBox attribute. However, you can change these dimensions using resize method. Input new wdth and height respectively.

```JavaScript
// create by string
const glyph = new Glyph('<svg>...</svg>')

// resize
glyph.resize(500, 500)
```

### Set Styles

Style method of the Glyph is able to add CSS rules to the entire SVG element.

```JavaScript
// create by string
const glyph = new Glyph('<svg>...</svg>')

// set styles
glyph.style({
    fill : 'red',
    opacity : 0.5
})
```

### Set Transformations

Transform properties can be added using Glyphs such as scale, flip, rotation. Just use the transform method with specific values.

```JavaScript
glyph.transform({
    angle : 180,
    scaleX : 2,
    scaleY : 3.5,
    flipX : false,
    flipY : true,
})
```

### Add Animations

Multiple animation can be added to the SVG using animate method by providing animation type, duration and animate values. Duration should be included in milliseconds.

```JavaScript
// animate using from-to
glyph.animate({
    rotate : { from : 0, to : 360, duration : 500 }
})

// animate using timeline points
glyph.animate({
    scale : { values : [1, 0.7, 1], duration : 1000 }
})
```

Every time you use animate method, previous animations will be removed. Therefore, add all the animations together as one input.

```JavaScript
// multiple animations
glyph.animate({
    rotate : { from : 0, to : 360, duration : 500 },
    scale : { values : [1, 0.7, 1], duration : 1000 }
})
```

### Convert to Data URLs

Using Glyphs, you are able to convert created element into SVG or PNG data URLs. This is important when you need the SVG for CSS developments and PNG for high resolution image processing (editing / graphic designing).

Use data url method and deal with the response. Include the mime type such as ```image/svg```, ```image/png``` or ```image/jpeg``` .

```JavaScript
glyph.toDataURL('image/svg').then(url => {
    // download url as file
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', 'my-icon.svg')
    a.click()
})
```

For PNG format, url will be created with SVG element dimensions. If you need high resolution, provide the width and height next the the mime type. This response will be delayed for larger resolutions and it's depend on your PC performance.

```JavaScript
glyph.toDataURL('image/png', 3000, 5000).then(url => {
    // png data url is here
})
```