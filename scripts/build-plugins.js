const fs = require('fs')
const path = require('path')

const plugins = fs.readdirSync(path.join(__dirname, '../node_modules/svgo/plugins/')).filter(p => p[0] !== '_').map(p => p.replace('.js', ''))

// generate the file which will bundle the plugins
fs.writeFileSync(path.join(__dirname, '../src/svgo-plugins.js'), `// auto generated, do no touch
// TODO: load from disk
export default {
${plugins.map(p => `  ${p}: require('svgo/plugins/${p}')`).join(',\n')}
}
`)

// check if all the plugins are documented
const readme = fs.readFileSync(path.join(__dirname, '../README.md'), 'utf8')
const pluginDocumented = readme.match(/^#### .*\n/gm).map(m => m.replace('####', '').trim())

plugins.forEach(p => {
  const index = pluginDocumented.indexOf(p)
  if (index === -1) {
    console.log(`⚠️   Missing documentation for ${p} (./node_modules/svgo/plugins/${p}.js)`)
  } else {
    pluginDocumented.splice(index, 1)
  }
})

pluginDocumented.forEach(p => {
  console.log(`⚠️   Extra documentation for non-existent ${p}`)
})

// check the default config
require('../src/defaultConfig').plugins.forEach(p => {
  if (plugins.indexOf(p.name) === -1) {
    console.log(`⚠️   Extra config for ${p.name} (./src/defaultConfig.json)`)
  }
})
