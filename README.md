# SVGO Compressor

A Plugin that compresses SVG assets using SVGO, right when you export them.

## Install

- Download [SVGO Compressor](https://github.com/sketch-hq/svgo-compressor/releases/latest/download/SVGO.Compressor.sketchplugin.zip) & unzip it.
- Double click **SVGO Compressor.sketchplugin** to install the Plugin.

## Usage

Selecting menu items or hitting keys is out of fashion. SVGO Compressor will compress your SVG assets whenever you export them, without you having to do anything.

You’ll get a message on your document window to let you know the compression worked as expected.

If you need uncompressed SVG assets, you can temporarily disable the Plugin by opening Sketch’s **Preferences › Plugins** and unchecking 'SVGO Compressor'. Or you can right-click any layer and select **Copy SVG Code**, and that will give you the original, uncompressed code.

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
