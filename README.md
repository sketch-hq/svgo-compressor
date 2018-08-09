# SVGO Compressor

A Plugin that compresses SVG assets using SVGO, right when you export them. This Plugin *requires* Sketch 3.8.

## Install

- Download [SVGO Compressor](https://github.com/BohemianCoding/svgo-compressor/releases/latest) & unzip it.
- Double click **SVGO Compressor.sketchplugin** to install the Plugin.

## Usage

Selecting menu items or hitting keys is out of fashion, so SVGO Compressor will compress your SVG assets whenever you export them, without you having to do anything.

You’ll get a message on your document window showing some stats about the process to let you know the compression worked as expected.

If you want your SVG assets uncompressed, you can temporarily disable the Plugin by opening Sketch’s **Preferences › Plugins** and unchecking 'SVGO Compressor'. Or you can right-click any layer and select **Copy SVG Code**, and that will give you the original, uncompressed code.

## Editing Settings

If for some reason you’re not happy with the default settings we’ve chosen, you can select **Plugins › SVGO Compressor › About SVGO Compressor** and then click the **Edit SVGO Settings…** button. You default editor will open the `svgo.json` file, where you’ll be able to tweak the settings.

### Top level settings

- `pretty`: Make SVG pretty printed
- `indent`: Indent number when pretty printing SVGs
- `multipass`: Run the optimization 10 times
- `floatPrecision`: The precision of the numbers to use in all the plugins

### SVGO Plugins

#### addAttributesToSVGElement

Adds attributes to an outer `<svg>` element

It will turn this:

```xml
<svg viewBox="0 0 100 50">
```

to this:

```xml
<svg width="100" height="50" viewBox="0 0 100 50">
```

Use the `attribute` parameter if you only have one attribute, or pass an array of attribute objects to `attributes`.

Can be used with one or more attributes

```xml
{
    "name": "addAttributesToSVGElement",
    "params": {
        "attribute": { "width": "100"},
        "attributes": [
            { "width": "100" },
            { "height": "50" }
        ]
    }
}
```

#### addClassesToSVGElement

Adds classes to an outer `<svg>` element

It will turn this:

```xml
<svg viewBox="0 0 100 50">
```

to this:

```xml
<svg viewBox="0 0 100 50" class="test another-test">
```

Use the `className` parameter if you only have one class, or pass an array of classes to `classNames`.

Can be used with one or more attributes

```xml
{
    "name": "addClassesToSVGElement",
    "params": {
        "className": "test",
        "classNames": [
            "test",
            "another-test"
        ]
    }
}
```

#### cleanupAttrs

Cleanups attributes from newlines, trailing and repeating spaces

What it does:

It removes newlines, trailing and repeating spaces from all attributes in an SVG. Sketch doesn't output extra white space or newlines in SVG attributes, so this plugin is not enabled by default in SVGO Compressor.

#### cleanupEnableBackground

Remove or cleanup enable-background attributes which coincides with a width/height box (see <http://www.w3.org/TR/SVG/filters.html#EnableBackgroundProperty>).

It will turn this:

```xml
<svg width="100" height="50" enable-background="new 0 0 100 50">
```

to this:

```xml
<svg width="100" height="50">
```

This is not needed in SVGO Compressor, since Sketch does not output enable-background attributes, so it's not enabled by default.

#### cleanupIDs

Removes unused IDs in the file, and minifies used IDs (only if there are no `<style>` or `<script>` tags).

It will turn this:

```xml
<defs>
    <rect id="path-1" x="0" y="0" width="100" height="100"></rect>
</defs>
<mask id="mask-2" fill="white">
    <use xlink:href="#path-1"></use>
</mask>
<use id="Mask" fill="#D8D8D8" xlink:href="#path-1"></use>
<rect id="Rectangle" fill="#D8D8D8" mask="url(#mask-2)" x="-10" y="-10" width="100" height="100"></rect>
```

into this:

```xml
<defs>
    <rect id="a" x="0" y="0" width="100" height="100"/>
</defs>
<mask id="b" fill="white">
    <use xlink:href="#a"/>
</mask>
<use fill="#D8D8D8" xlink:href="#a"/>
<rect fill="#D8D8D8" mask="url(#b)" x="-10" y="-10" width="100" height="100"/>
```

By default, SVGO will change the IDs for paths in `defs`, using minified names (`a`, `b`…), and this may not be ideal for all scenarios (i.e: if you export multiple SVG assets for use on a web page, they'll use the same IDs for paths on different assets).

We work around this issue by adding a prefix for each asset, based on its filename. You can disable this behaviour by setting `minify` to `false` in `svgo.json`:

```json
"plugins": [
  {
    "name": "cleanupIDs",
    "params": {
      "minify": false
    }
  }
]
```

TODO: send SVGO a pull request to do this on their side, using something like an `autoprefix` param.

TODO: we should do a better job with this in Sketch, since we're basically using `path-X` ourselves, where `X` is a number that starts from 1 for *each* exported asset. We should probably use the path name, or something derived from it.

#### cleanupListOfValues

Rounds list of values to the fixed precision (defaults to 3 decimals) in the following attributes:

- points
- enable-background
- viewBox
- stroke-dasharray
- dx
- dy
- x
- y

It won't round `width`, `height` or `transform` attributes.

Turns this

```xml
<polygon points="208.250977 77.1308594 223.069336 ... "/>
```

into this

```xml
<polygon points="208.251 77.131 223.069 ... "/>
```

It is enabled by default in SVGO Compressor, and we default it to 3 decimals. If you want to change the precision, you can do so in `svgo.json`:

```json
"plugins": [
  {
    "name": "cleanupListOfValues",
    "params": {
      "floatPrecision": 1
    }
  }
]
```

#### cleanupNumericValues

Rounds numeric values to the fixed precision, removes default ‘px’ units.

Enabled by default in SVGO Compressor.

#### collapseGroups

Collapses useless groups.

Turns this:

```xml
<g>
  <g attr1="val1">
    <path d="..."/>
  </g>
</g>
```

 into this

```xml
 <path attr1="val1" d="..."/>
```

Enabled by default in SVGO Compressor.

#### convertColors

Converts colors: `rgb()` to `#rrggbb` and `#rrggbb` to `#rgb`.

It supports the following features:

- Convert color name keyword to long hex (`names2hex` param, enabled by default)
  - `fuchsia` ➡ `#ff00ff`
- Convert `rgb()` to long hex (`rgb2hex` param, enabled by default)
  - `rgb(255, 0, 255)` ➡ `#ff00ff`
  - `rgb(50%, 100, 100%)` ➡ `#7f64ff`
- Convert long hex to short hex (`shorthex` param, enabled by default)
  - `#aabbcc` ➡ `#abc`
- Convert hex to short name (`shortname` param, enabled by default). Converts hex to color name if the color name is shorter than the hex value.
  - `#000080` ➡ `navy`

#### convertPathData

Optimizes path data: writes in shorter form, applies transformations.

Since this modifies path data, it's **off by default in SVGO Compressor**.

#### convertShapeToPath

Converts basic shapes to more compact path form.

This is turned off in SVGO Compressor, since it will turn your `rect`s and `polygon`s into `path`s, which might not be ideal if you plan on doing SVG animation.

#### convertStyleToAttrs

Converts style in attributes. Cleanups comments and invalid declarations (without colon) as a side effect.

Turns this

```xml
<g style="fill:#000; color: #fff; -webkit-blah: blah">
```

into this

```xml
<g fill="#000" color="#fff" style="-webkit-blah: blah">
```

Enabled by default in SVGO Compressor.

#### convertTransform

Converts matrices to the short aliases, converts long translate, scale or rotate transform notations to the shorts ones, converts transforms to the matrices and multiply them all into one, remove useless transforms.

Enabled by default in SVGO Compressor.

#### inlineStyles

Moves + merges styles from style elements to element styles.

Off by default in SVGO Compressor.

#### mergePaths

Merges multiple Paths into one.

Enabled by default in SVGO Compressor.

#### minifyStyles

Minifies styles (`<style>` element + style attribute)

Enabled by default in SVGO Compressor.

#### moveElemsAttrsToGroup

Collapses content's intersected and inheritable attributes to the existing group wrapper.

Turns this

```xml
<g attr1="val1">
  <g attr2="val2">
    text
  </g>
  <circle attr2="val2" attr3="val3"/>
</g>
```

into this

```xml
<g attr1="val1" attr2="val2">
  <g>
    text
  </g>
  <circle attr3="val3"/>
</g>
```

Off by default in SVGO Compressor.

#### moveGroupAttrsToElems

Moves group attrs to the content elements.

Turns this

```xml
<g transform="scale(2)">
  <path transform="rotate(45)" d="M0,0 L10,20"/>
  <path transform="translate(10, 20)" d="M0,10 L20,30"/>
</g>
```

into this

```xml
<g>
  <path transform="scale(2) rotate(45)" d="M0,0 L10,20"/>
  <path transform="scale(2) translate(10, 20)" d="M0,10 L20,30"/>
</g>
```

Off by default in SVGO Compressor.

#### prefixIds

Add a prefix to IDs.

Off by default in SVGO Compressor.

#### removeAttrs

Removes the specified attributes in the plugin params.

Example:

```json
"plugins": [
  {
    "name": "removeAttrs",
    "params": {
      "attrs": "fill"
    }
  }
]
```

will remove all the `fill` attributes in the file.

Off by default for obvious reasons in SVGO Compressor.

#### removeComments

Removes comments in the SVG file. Gets rid of the `<!-- Generator: Sketch 42 (36781) - http://www.bohemiancoding.com/sketch -->` bit.

Enabled by default in SVGO Compressor.

#### removeDesc

Removes `<desc>`. Gets rid of the `<desc>Created with Sketch.</desc>` bit.

Enabled by default in SVGO Compressor.

#### removeDimensions

Removes width/height attributes when a viewBox attribute is present.

Off by default in SVGO Compressor, because it sometimes messes with rendering on web pages.

#### removeDoctype

Removes DOCTYPE declaration.

Enabled by default in SVGO Compressor.

#### removeEditorsNSData

Removes editors namespaces, elements and attributes.

This is on by default in SVGO Compressor for historical reasons, but it's not really needed since Sketch no longer outputs an editor namespace.

#### removeElementsByAttr

Removes arbitrary SVG elements by ID or className.

Example:

```json
"plugins": [
  {
    "name": "removeElementsByAttr",
    "params": {
      "id": "elementID"
    }
  }
]
```

will remove all the elements whose `id` is `elementID`.

Off by default for obvious reasons in SVGO Compressor.

#### removeEmptyAttrs

Removes attributes with empty values.

On by default in SVGO Compressor.

#### removeEmptyContainers

Removes empty container elements.

Turns this

```xml
<g>
  <marker>
    <a/>
  </marker>
</g>
```

into _nothing_.

On by default in SVGO Compressor.

#### removeEmptyText

Removes empty Text elements.

On by default in SVGO Compressor.

#### removeHiddenElems

Removes hidden elements with disabled rendering:

- display="none"
- opacity="0"
- circle with zero radius
- ellipse with zero x-axis or y-axis radius
- rectangle with zero width or height
- pattern with zero width or height
- image with zero width or height
- path with empty data
- polyline with empty points
- polygon with empty points

Off by default in SVGO Compressor, since Sketch does not export hidden elements.

#### removeMetadata

Removes `<metadata>`.

On by default in SVGO Compressor.

#### removeNonInheritableGroupAttrs

Removes non-inheritable group's "presentation" attributes.

On by default in SVGO Compressor.

#### removeRasterImages

Removes raster images references in `<image>`.

Off by default in SVGO Compressor, since it's pretty destructive.

#### removeScriptElement

Removes the `<script>` element.

Off by default in SVGO Compressor.

#### removeStyleElement

Removes the `<style>` element.

Off by default in SVGO Compressor.

#### removeTitle

Removes `<title>`.

On by default in SVGO Compressor, but you may consider disabling it for accessibility reasons.

#### removeUnknownsAndDefaults

Removes unknown elements' content and attributes, removes attrs with default values.

On by default in SVGO Compressor.

#### removeUnusedNS

Removes unused namespaces declaration.

On by default in SVGO Compressor.

#### removeUselessDefs

Removes content of defs and properties that aren't rendered directly without ids.

On by default in SVGO Compressor.

#### removeUselessStrokeAndFill

Removes useless stroke and fill attrs.

On by default in SVGO Compressor.

#### removeViewBox

Removes viewBox attr which coincides with a width/height box.

Turns this

```xml
<svg width="100" height="50" viewBox="0 0 100 50">
```

into this

```xml
<svg width="100" height="50">
```

Off by default in SVGO Compressor.

#### removeXMLNS

Removes the `xmlns` attribute when present.

Turns this

```xml
<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
```

into this

```xml
<svg viewBox="0 0 100 50">
```

On by default in SVGO Compressor.

#### removeXMLProcInst

Removes XML Processing Instruction (the `<?xml version="1.0" encoding="UTF-8"?>` bit).

On by default in SVGO Compressor.

#### sortAttrs

Sorts element attributes to improve readability.

On by default in SVGO Compressor.

## Acknowledgements

We would like to thank:

- The [SVGO project](https://github.com/svg/svgo), for creating the golden standard for SVG compression.
- [Andrey Shakhmin](https://github.com/turbobabr), for his inspiration during the [Hamburg Hackathon](http://designtoolshackday.com), where he showed us how to use node modules inside Sketch.

## Development

This plugin is built using [skpm](https://github.com/skpm/skpm). To build it, just run

```
npm i
npm run build
```

To edit the Plugin's code, edit the code in `src` and run `npm run build` again (or, for the ultimate laziness, run `npm run watch` and it will observe any changes in the files and rebuild the Plugin every time you save them.)

For more details, check the [skpm documentation](https://github.com/skpm/skpm).
