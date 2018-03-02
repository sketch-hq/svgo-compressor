const fs = require('fs')
const path = require('path')

const plugins = fs.readdirSync(path.join(__dirname, '../node_modules/svgo/plugins/')).filter(p => p[0] !== '_').map(p => p.replace('.js', ''))

fs.writeFileSync(path.join(__dirname, '../src/svgo-plugins.js'), `// auto generated, do no touch
// TODO: load from disk
export default {
${plugins.map(p => `  ${p}: require('svgo/plugins/${p}')`).join(',\n')}
}
`)
