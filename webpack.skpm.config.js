/**
 * Function that mutates original webpack config.
 * Supports asynchronous changes when promise is returned.
 *
 * @param {object} config - original webpack config.
 * @param {boolean} isPluginCommand - wether the config is for a plugin command or a resource
 **/
module.exports = function (config, isPluginCommand) {
  if (!config.resolve) {
    config.resolve = {}
  }
  if (!config.resolve.alias) {
    config.resolve.alias = {}
  }
  config.resolve.alias.fs = '@skpm/fs'
}
