import fs from '@skpm/fs'
import dialog from '@skpm/dialog'
import UI from 'sketch/ui'
import { optimize } from 'svgo'

export function showAbout() {
  // Plugin was run from the menu, so let's open the about window
  const response = dialog.showMessageBox({
    message: "About SVGO Compressor",
    detail: "This Plugin uses SVGO to compress SVG assets exported from Sketch.\n\nIt works automatically whenever you export to SVG, so you don’t need to do anything special. Just work on your design as always, and enjoy smaller & cleaner SVG files."
  })
}

export function compress(context) {
  const exports = context.actionContext.exports
  let filesToCompress = 0
  exports.forEach(currentExport => {
    if (currentExport.request.format() == 'svg') {
      filesToCompress++
      let currentFile
      // This was broken momentarily between Sketch 76 and 77
      // so we need to use a workaround
      currentFile = currentExport.path
      if (currentExport.path.path !== undefined) {
        currentFile = currentExport.path.path()
      }
      const svgString = fs.readFileSync(currentFile, 'utf8')

      // Load external SVGO config, if it exists
      const homeDir = NSHomeDirectory()
      const configFile = homeDir + '/Library/Application\ Support/com.bohemiancoding.sketch3/Plugins/svgo.config.js'
      let externalConfig = {}
      if (fs.existsSync(configFile)) {
        // Do not explode if the file is not valid JS
        try {
          externalConfig = eval(fs.readFileSync(configFile, 'utf8'))
        } catch (error) {
          console.log("Error: " + error.message)
        }
      }

      const config = {...externalConfig, ...{
        path: currentFile,
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
        ]
      }}
      const result = optimize(svgString, config)
      fs.writeFileSync(currentFile, result.data, 'utf8')
    }
  })
  UI.message(`SVGO Compressor: ${filesToCompress} file${filesToCompress == 1 ? '' : 's'} compressed`)
}