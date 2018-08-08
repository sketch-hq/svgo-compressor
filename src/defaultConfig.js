// The way to setup SVGO Plugins is a bit convoluted, due to the fact that CocoaScript
// doesn't really play well with the 'require's used in SVGO. So apologies in advance
// for the clunky method…
//
// So, for every SVGO Plugin you want to use, you'll have to add an object to svgoJSON.plugins,
// with a 'name' key and a 'params' key (optional, only needed if you want to change any of the default params for a plugin)
//
// This is the list of SVGO Plugins available as of 2016-05-26:
// TODO: keep this list updated automatically
//
// - addAttributesToSVGElement - adds attributes to an outer <svg> element
// - addClassesToSVGElement - add classnames to an outer <svg> element
// - cleanupAttrs - cleanup attributes from newlines, trailing and repeating spaces
// - cleanUpEnableBackground - remove or cleanup enable-background attribute when possible
// - cleanupIDs - remove unused and minify used IDs
// - cleanupListOfValues - round numeric values in attributes that take a list of numbers, like viewBox or enableBackground
// - cleanupNumericValues - round numeric values to the fixed precision, remove default 'px' units
// - collapseGroups - collapse useless groups
// - convertColors - convert colors (from rgb() to #rrggbb, from #rrggbb to #rgb)
// - convertPathData - convert Path data to relative or absolute whichever is shorter, convert one segment to another, trim useless delimiters, smart rounding and much more
// - convertShapeToPath - convert some basic shapes to path
// - convertStyleToAttrs - convert styles into attributes
// - convertTransform - collapse multiple transforms into one, convert matrices to the short aliases and much more
// - mergePaths - merge multiple Paths into one
// - minifyStyles - minify <style> elements content with CSSO
// - moveElemsAttrsToGroup - move elements attributes to the existing group wrapper
// - moveGroupAttrsToElems - move some group attributes to the content elements
// - removeAttrs - remove attributes by pattern
// - removeComments - remove comments
// - removeDesc - remove <desc> (only non-meaningful by default)
// - removeDimensions - remove width/height attributes if viewBox is present
// - removeDoctype - remove doctype declaration
// - removeEditorsNSData - remove editors namespaces, elements and attributes
// - removeEmptyAttrs - remove empty attributes
// - removeEmptyContainers - remove empty Container elements
// - removeEmptyText - remove empty Text elements
// - removeHiddenElems - remove hidden elements
// - removeMetadata - remove <metadata>
// - removeNonInheritableGroupAttrs - remove non-inheritable group's "presentation" attributes
// - removeRasterImages - remove raster images
// - removeStyleElement - remove <style> elements
// - removeTitle - remove <title>
// - removeUnknownsAndDefaults - remove unknown elements content and attributes, remove attrs with default values
// - removeUnusedNS - remove unused namespaces declaration
// - removeUselessDefs - remove elements of <defs> without id
// - removeUselessStrokeAndFill - remove useless stroke and fill attrs
// - removeViewBox - remove viewBox attribute when possible
// - removeXMLProcInst - remove XML processing instructions
// - sortAttrs - sort element attributes for epic readability
// - transformsWithOnePath - apply transforms, crop by real width, center vertical alignment and resize SVG with one Path inside
//
// These are some sane defaults we've found to work reasonably well, compressing your SVG without
// altering the shapes or the look. Your milleage may vary, so feel free to tweak these…

module.exports = {
  "comment": "This is the settings file for the SVGO Compressor Plugin. For more info, please check <https://github.com/BohemianCoding/svgo-compressor>",
  "pretty": true,
  "indent": 2,
  "plugins":[
    { "name": "cleanupIDs" },
    { "name": "cleanupListOfValues" },
    { "name": "cleanupNumericValues" },
    { "name": "collapseGroups" },
    { "name": "convertColors" },
    { "name": "convertStyleToAttrs" },
    { "name": "convertTransform" },
    { "name": "mergePaths" },
    { "name": "minifyStyles" },
    { "name": "removeComments" },
    { "name": "removeDesc", "params": { "removeAny": true } },
    { "name": "removeDoctype" },
    { "name": "removeEditorsNSData" },
    { "name": "removeEmptyAttrs" },
    { "name": "removeEmptyContainers" },
    { "name": "removeEmptyText" },
    { "name": "removeMetadata" },
    { "name": "removeNonInheritableGroupAttrs" },
    { "name": "removeTitle" },
    { "name": "removeUnknownsAndDefaults" },
    { "name": "removeUnusedNS" },
    { "name": "removeUselessDefs" },
    { "name": "removeUselessStrokeAndFill" },
    { "name": "removeXMLProcInst" },
    { "name": "sortAttrs" }
  ]
}
