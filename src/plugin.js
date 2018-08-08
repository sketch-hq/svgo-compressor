import getConfig, {svgoJSONFilePath} from './getConfig'
import fs from '@skpm/fs'
import dialog from '@skpm/dialog'
import {spawnSync} from '@skpm/child_process'
import svgo from 'svgo'
import svgoPlugins from './svgo-plugins'
import UI from 'sketch/ui'

export function openSettings() {
  const config = getConfig()

  // Plugin was run from the menu, so let's open the settings window
  const response = dialog.showMessageBox({
    buttons: ['Edit SVGO Settings…', 'Cancel'],
    message: "About SVGO Compressor",
    detail: "This Plugin uses SVGO to compress SVG assets exported from Sketch.\n\nIt works automatically whenever you export to SVG, so you don’t need to do anything special. Just work on your design as always, and enjoy smaller & cleaner SVG files.\n\nIf for some reason you’re not happy with the default options, you can edit the svgo.json file in the Application Support folder for Sketch.\n"
  })

  if (response === 0) {
    // open the config
    spawnSync("/usr/bin/open", [svgoJSONFilePath])
  }
}

export function compress(context) {
  const svgoJSON = getConfig()
  if (typeof svgoJSON.enabled !== 'undefined' && !svgoJSON.enabled) {
    return
  }

  const parsedSVGOPlugins = []
  svgoJSON.plugins.forEach(item => {
    const plugin = svgoPlugins[item.name]
    if (!plugin) {
      log('Plugin not found: ' + item.name)
      return
    }
    log('Enabled plugin: ' + item.name)
    plugin.pluginName = item.name
    plugin.active = true
    if (plugin.params) {
      // Plugin supports params
      log('—› default params: ' + JSON.stringify(plugin.params, null, 2))
    }
    if (item.params != null) {
      log('—› new params: ' + JSON.stringify(item.params, null, 2))
      if (typeof plugin.params === 'undefined') {
        plugin.params = {}
      }
      for (var attrname in item.params) {
        plugin.params[attrname] = item.params[attrname]
      }
      log('—› resulting params: ' + JSON.stringify(plugin.params, null, 2))
    }
    parsedSVGOPlugins.push([plugin])
  })

  var exports = context.actionContext.exports
  var filesToCompress = []
  for (var i=0; i < exports.length; i++) {
    var currentExport = exports[i]
    if (currentExport.request.format() == 'svg') {
      filesToCompress.push(currentExport.path)
    }
  }

  if (filesToCompress.length > 0) {
    log('Let‘s go…')
    let originalTotalSize = 0
    let compressedTotalSize = 0
    if (typeof svgoJSON.pretty === 'undefined') { svgoJSON.pretty = true }
    if (typeof svgoJSON.indent === 'undefined') { svgoJSON.indent = 2 }
    const svgCompressor = new svgo({
      full: true,
      js2svg: {
        pretty: svgoJSON.pretty,
        indent: svgoJSON.indent
      },
      plugins: parsedSVGOPlugins
      // multipass: true
      // floatPrecision: 1
    })
    Promise.all(filesToCompress.map(currentFile => {
      const svgString = fs.readFileSync(currentFile, 'utf8')
      originalTotalSize += svgString.length

      // Hacks for plugins
      svgCompressor.config.plugins.forEach(([plugin]) => {
        // cleanupIDs
        if (plugin.pluginName == "cleanupIDs") {
          const parts = currentFile.split('/')
          var prefix = parts[parts.length - 1].replace('.svg', '').replace(/\s+/g, '-').toLowerCase() + "-"
          log('Setting cleanupIDs prefix to: ' + prefix)
          plugin.params['prefix'] = prefix
        }
      })

      return svgCompressor.optimize(svgString).then(result => {
        compressedTotalSize += result.data.length
        fs.writeFileSync(currentFile, result.data, 'utf8')
      })
    })).then(() => {
      var compressionRatio = (100 - ((compressedTotalSize * 100) / originalTotalSize)).toFixed(2)
      var msg = filesToCompress.length + " SVG files compressed by " + compressionRatio + "%, from " + originalTotalSize + " bytes to " + compressedTotalSize + " bytes."
      log(msg)
      UI.message(msg)
    })
  }
}
