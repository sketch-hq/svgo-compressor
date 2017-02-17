var svgo                           = require('svgo')
var addAttributesToSVGElement      = require('svgo/plugins/addAttributesToSVGElement')
var addClassesToSVGElement         = require('svgo/plugins/addClassesToSVGElement')
var cleanupAttrs                   = require('svgo/plugins/cleanupAttrs')
var cleanupEnableBackground        = require('svgo/plugins/cleanupEnableBackground')
var cleanupIDs                     = require('svgo/plugins/cleanupIDs')
var cleanupListOfValues            = require('svgo/plugins/cleanupListOfValues')
var cleanupNumericValues           = require('svgo/plugins/cleanupNumericValues')
var collapseGroups                 = require('svgo/plugins/collapseGroups')
var convertColors                  = require('svgo/plugins/convertColors')
var convertPathData                = require('svgo/plugins/convertPathData')
var convertShapeToPath             = require('svgo/plugins/convertShapeToPath')
var convertStyleToAttrs            = require('svgo/plugins/convertStyleToAttrs')
var convertTransform               = require('svgo/plugins/convertTransform')
var mergePaths                     = require('svgo/plugins/mergePaths')
var minifyStyles                   = require('svgo/plugins/minifyStyles')
var moveElemsAttrsToGroup          = require('svgo/plugins/moveElemsAttrsToGroup')
var moveGroupAttrsToElems          = require('svgo/plugins/moveGroupAttrsToElems')
var removeAttrs                    = require('svgo/plugins/removeAttrs')
var removeComments                 = require('svgo/plugins/removeComments')
var removeDesc                     = require('svgo/plugins/removeDesc')
var removeDimensions               = require('svgo/plugins/removeDimensions')
var removeDoctype                  = require('svgo/plugins/removeDoctype')
var removeEditorsNSData            = require('svgo/plugins/removeEditorsNSData')
var removeElementsByAttr           = require('svgo/plugins/removeElementsByAttr')
var removeEmptyAttrs               = require('svgo/plugins/removeEmptyAttrs')
var removeEmptyContainers          = require('svgo/plugins/removeEmptyContainers')
var removeEmptyText                = require('svgo/plugins/removeEmptyText')
var removeHiddenElems              = require('svgo/plugins/removeHiddenElems')
var removeMetadata                 = require('svgo/plugins/removeMetadata')
var removeNonInheritableGroupAttrs = require('svgo/plugins/removeNonInheritableGroupAttrs')
var removeRasterImages             = require('svgo/plugins/removeRasterImages')
var removeStyleElement             = require('svgo/plugins/removeStyleElement')
var removeTitle                    = require('svgo/plugins/removeTitle')
var removeUnknownsAndDefaults      = require('svgo/plugins/removeUnknownsAndDefaults')
var removeUnusedNS                 = require('svgo/plugins/removeUnusedNS')
var removeUselessDefs              = require('svgo/plugins/removeUselessDefs')
var removeUselessStrokeAndFill     = require('svgo/plugins/removeUselessStrokeAndFill')
var removeViewBox                  = require('svgo/plugins/removeViewBox')
var removeXMLNS                    = require('svgo/plugins/removeXMLNS')
var removeXMLProcInst              = require('svgo/plugins/removeXMLProcInst')
var sortAttrs                      = require('svgo/plugins/sortAttrs')
var transformsWithOnePath          = require('svgo/plugins/transformsWithOnePath')

export const SketchPlugin = {
  name: "SVGO Compressor",
  description: "A Plugin that compresses SVG assets using SVGO, right when you export them. This Plugin *requires* Sketch 3.8.",
  author: "Ale Muñoz",
  authorEmail: "ale@sketchapp.com",
  version: "1.3.6",
  identifier: "com.sketchapp.plugins.svgo-compressor",
  homepage: "https:/github.com/BohemianCoding/svgo-compressor",
  compatibleVersion: 3.8,
  commands: {
    svgo: {
      name: 'About SVGO Compressor',
      handlers: {
        run : "___svgo_run_handler_",
        actions: {
          "ExportSlices": "___svgo_run_handler_", // TODO: Fix this ugly hack
          "Export": "___svgo_run_handler_" // TODO: Fix this ugly hack
        }
      },
      run(context) {
        var svgoJSONFilePath = MSPluginManager.mainPluginsFolderURL().path() + '/svgo.json'
        var svgoJSON
        if (NSFileManager.defaultManager().fileExistsAtPath(svgoJSONFilePath)) {
          log('Reading SVGO defaults from JSON file')
          svgoJSON = JSON.parse(NSString.stringWithContentsOfFile_encoding_error(svgoJSONFilePath, NSUTF8StringEncoding, nil))
        } else {
          // The way to setup SVGO Plugins is a bit convoluted, due to the fact that CocoaScript
          // doesn't really play well with the 'require's used in SVGO. So apologies in advance
          // for the clunky method…
          // 
          // So, for every SVGO Plugin you want to use, you'll have to add an object to svgoJSON.plugins,
          // with a 'name' key and a 'params' key (optional, only needed if you want to change any of the default params for a plugin)
          // 
          // This is the list of SVGO Plugins available as of 2016-05-26:
          // 
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
          svgoJSON = {
            "comment": "This is the settings file for the SVGO Compressor Plugin. For more info, please check <https://github.com/BohemianCoding/svgo-compressor>",
            "pretty": true,
            "indent": 2,
            "plugins":[
              { "name": "cleanupAttrs" },
              { "name": "cleanupEnableBackground" },
              { "name": "cleanupIDs" },
              { "name": "cleanupListOfValues" },
              { "name": "cleanupNumericValues" },
              { "name": "collapseGroups" },
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
          NSString.stringWithString(JSON.stringify(svgoJSON, null, '  ')).writeToFile_atomically_encoding_error(svgoJSONFilePath, true, NSUTF8StringEncoding, nil)
        }

        if (!context.actionContext) {
          // Plugin was run from the menu, so let's open the settings window
          // context.document.showMessage("Opening Settings")
          var alert = COSAlertWindow.new()
          alert.setMessageText("About SVGO Compressor")
          alert.setInformativeText("This Plugin uses SVGO to compress SVG assets exported from Sketch.\n\nIt works automatically whenever you export to SVG, so you don’t need to do anything special. Just work on your design as always, and enjoy smaller & cleaner SVG files.\n\nIf for some reason you’re not happy with the default options, you can edit the svgo.json file in the Application Support folder for Sketch.\n")
          alert.addButtonWithTitle('Edit SVGO Settings…')
          alert.addButtonWithTitle('Cancel')

          var response = alert.runModal()
          if(response === 1000) {
            var open_finder = NSTask.alloc().init(),
                open_finder_args = NSArray.arrayWithObjects(svgoJSONFilePath, nil)
                open_finder.setLaunchPath("/usr/bin/open")
                open_finder.setArguments(open_finder_args)
                open_finder.launch()
          }
        } else {
          var parsedSVGOPlugins = []
          for (var j=0; j < svgoJSON.plugins.length; j++) {
            var item = svgoJSON.plugins[j]
            var plugin = eval(item.name)
            log('Enabled plugin: ' + item.name)
            plugin.active = true
            if (plugin.params) {
              // Plugin supports params
              log('—› default params: ' + JSON.stringify(plugin.params, null, 2))
              if (item.params != null) {
                log('—› new params: ' + JSON.stringify(item.params, null, 2))
                if (plugin.params == undefined) {
                  plugin.params = {}
                }
                for (var attrname in item.params) {
                  plugin.params[attrname] = item.params[attrname]
                }
                log('—› resulting params: ' + JSON.stringify(plugin.params, null, 2))
              }
            }
            parsedSVGOPlugins.push([plugin])
          }
          var exports = context.actionContext.exports
          var filesToCompress = []
          for (var i=0; i < exports.count(); i++) {
            var currentExport = exports.objectAtIndex(i)
            if (currentExport.request.format() == 'svg') {
              filesToCompress.push(currentExport.path)
            }
          }

          if (filesToCompress.length > 0) {
            var originalTotalSize = 0
            var compressedTotalSize = 0
            if (svgoJSON.pretty == null) { svgoJSON.pretty = true }
            if (svgoJSON.indent == null) { svgoJSON.indent = 2 }
            var svgCompressor = new svgo({
              full: true,
              js2svg: {
                pretty: svgoJSON.pretty,
                indent: svgoJSON.indent
              },
              plugins: parsedSVGOPlugins
            })
            for (var i=0; i < filesToCompress.length; i++) {
              var currentFile = filesToCompress[i]
              var svgString = "" + NSString.stringWithContentsOfFile_encoding_error(currentFile, NSUTF8StringEncoding, nil)
              originalTotalSize += svgString.length
              svgCompressor.optimize(svgString, function(result) {
                compressedTotalSize += result.data.length
                NSString.stringWithString(result.data).writeToFile_atomically_encoding_error(currentFile, true, NSUTF8StringEncoding, nil)
              })
            }
            var compressionRatio = (100 - ((compressedTotalSize * 100) / originalTotalSize)).toFixed(2)
            var msg = filesToCompress.length + " SVG files compressed by " + compressionRatio + "%, from " + originalTotalSize + " bytes to " + compressedTotalSize + " bytes."
            log(msg)
            NSApplication.sharedApplication().orderedDocuments().firstObject().showMessage(msg)
          }
        }
      }
    }
  }
};