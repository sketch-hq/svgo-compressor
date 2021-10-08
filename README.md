# SVGO Compressor

A Plugin that compresses SVG assets using SVGO, right when you export them.

## Install

- Download [SVGO Compressor](https://github.com/sketch-hq/svgo-compressor/releases/latest/download/SVGO.Compressor.sketchplugin.zip) & unzip it.
- Double click **SVGO Compressor.sketchplugin** to install the Plugin.

## Usage

Selecting menu items or hitting keys is out of fashion. SVGO Compressor will compress your SVG assets whenever you export them, without you having to do anything.

You’ll get a message on your document window to let you know the compression worked as expected.

If you need uncompressed SVG assets, you can temporarily disable the Plugin by opening Sketch’s **Preferences › Plugins** and unchecking 'SVGO Compressor'. Or you can right-click any layer and select **Copy SVG Code**, and that will give you the original, uncompressed code.

## Custom SVGO configuration

SVGO Compressor uses a default configuration that does a reasonable job of compressing SVG code, while maintaining compatibility and avoiding rendering issues. If you need to change the defaults, you can do so by creating an `svgo.config.js` file in Sketch's `Plugins` directory (located by default in `~/Library/Application\ Support/com.bohemiancoding.sketch3/Plugins/`).

For a complete reference of what your SVGO config should look like, see [SVGO’s configuration documentation](https://github.com/svg/svgo#configuration).

Any option that is not set on your custom configuration will use the defaults set by SVGO Compressor. For example, here's how a sample configuration to output unminified code could look like:

```javascript
module.exports = {
  js2svg: {
    indent: 2,
    pretty: true,
  }
}
```

Keep in mind that our defaults do not match the ones in SVGO 100%. If you use the `preset-default` option in SVGO your results may vary from the ones this plugin exports. For the record, here's the default configuration we use:

```
{
  path: currentFile, // This is the path to the currently exported SVG asset
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          inlineStyles: false,
          convertStyleToAttrs: true,
          cleanupListOfValues: true,
          removeViewBox: false,
          cleanupEnableBackground: false,
          removeHiddenElems: false,
          convertShapeToPath: false,
          moveElemsAttrsToGroup: false,
          moveGroupAttrsToElems: false,
          convertPathData: false,
          sortAttrs: true,
        }
      }
    }
  ],
}
```


Again, for more information about custom configurations please refer to SVGO's own documentation. Please note that the custom plugins feature is untested in SVGO Compressor, so it may or may not work.

## Acknowledgements

We would like to thank:

- The [SVGO project](https://github.com/svg/svgo), for creating the golden standard for SVG compression.
- [Andrey Shakhmin](https://github.com/turbobabr), for his inspiration during the [Hamburg Hackathon](http://designtoolshackday.com), where he showed us how to use node modules inside Sketch.

## Development

This plugin is built using [skpm](https://github.com/skpm/skpm). To build it, just run

```bash
npm i
npm run build
```

To edit the Plugin's code, edit the code in `src` and run `npm run build`. You can also run `npm run watch` to automatically rebuild the Plugin every time you make changes in the code.
