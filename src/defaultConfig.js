// The way to setup SVGO Plugins is a bit convoluted, due to the fact that CocoaScript
// doesn't really play well with the 'require's used in SVGO. So apologies in advance
// for the clunky method…
//
// So, for every SVGO Plugin you want to use, you'll have to add an object to svgoJSON.plugins,
// with a 'name' key and a 'params' key (optional, only needed if you want to change any of the default params for a plugin)
//
// This is the list of SVGO Plugins available taken from https://github.com/svg/svgo/blob/master/.svgo.yml. The order is important!
//
// These are some sane defaults we've found to work reasonably well, compressing your SVG without
// altering the shapes or the look. Your milleage may vary, so feel free to tweak these…

module.exports = {
  "comment": "This is the settings file for the SVGO Compressor Plugin. For more info, please check <https://github.com/BohemianCoding/svgo-compressor>",
  "pretty": true,
  "indent": 2,
  "floatPrecision": 3,
  "plugins":[
    { "name": "removeDoctype", enabled: true },
    { "name": "removeXMLProcInst", enabled: true },
    { "name": "removeComments", enabled: true },
    { "name": "removeMetadata", enabled: true },
    { "name": "removeXMLNS", enabled: false },
    { "name": "removeEditorsNSData", enabled: true },
    { "name": "cleanupAttrs", enabled: false },
    { "name": "inlineStyles", enabled: false },
    { "name": "minifyStyles", enabled: true },
    { "name": "convertStyleToAttrs", enabled: true },
    { "name": "cleanupIDs", enabled: true },
    { "name": "prefixIds", enabled: false },
    { "name": "removeRasterImages", enabled: false },
    { "name": "removeUselessDefs", enabled: true },
    { "name": "cleanupNumericValues", enabled: true },
    { "name": "cleanupListOfValues", enabled: true },
    { "name": "convertColors", enabled: true },
    { "name": "removeUnknownsAndDefaults", enabled: true },
    { "name": "removeNonInheritableGroupAttrs", enabled: true },
    { "name": "removeUselessStrokeAndFill", enabled: true },
    { "name": "removeViewBox", enabled: false },
    { "name": "cleanupEnableBackground", enabled: false },
    { "name": "removeHiddenElems", enabled: false },
    { "name": "removeEmptyText", enabled: true },
    { "name": "convertShapeToPath", enabled: false },
    { "name": "moveElemsAttrsToGroup", enabled: false },
    { "name": "moveGroupAttrsToElems", enabled: false },
    { "name": "collapseGroups", enabled: true },
    { "name": "convertPathData", enabled: false },
    { "name": "convertTransform", enabled: true },
    { "name": "removeEmptyAttrs", enabled: true },
    { "name": "removeEmptyContainers", enabled: true },
    { "name": "mergePaths", enabled: true },
    { "name": "removeUnusedNS", enabled: true },
    { "name": "sortAttrs", enabled: true },
    { "name": "removeTitle", enabled: true },
    { "name": "removeDesc", enabled: true, "params": { "removeAny": true } },
    { "name": "removeDimensions", enabled: false },
    { "name": "removeAttrs", enabled: false },
    { "name": "removeAttributesBySelector", enabled: false },
    { "name": "removeElementsByAttr", enabled: false },
    { "name": "addClassesToSVGElement", enabled: false },
    { "name": "removeStyleElement", enabled: false },
    { "name": "removeScriptElement", enabled: false },
    { "name": "addAttributesToSVGElement", enabled: false },
    { "name": "removeOffCanvasPaths", enabled: false },
    { "name": "reusePaths", enabled: false }
  ]
}
