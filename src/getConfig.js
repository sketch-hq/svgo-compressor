import fs from '@skpm/fs'

export const svgoJSONFilePath = MSPluginManager.mainPluginsFolderURL().path() + '/svgo.json'

export default function () {
  let svgoJSON
  if (fs.existsSync(svgoJSONFilePath)) {
    console.log('Reading SVGO defaults from JSON file')
    svgoJSON = JSON.parse(fs.readFileSync(svgoJSONFilePath, 'utf8'))
  } else {
    svgoJSON = require('./defaultConfig')
    fs.writeFileSync(svgoJSONFilePath, JSON.stringify(svgoJSON, null, '  '), 'utf8')
  }

  return svgoJSON
}
