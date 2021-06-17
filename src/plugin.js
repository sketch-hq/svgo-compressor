import getConfig, { svgoJSONFilePath } from "./getConfig";
import path from "@skpm/path";
import fs from "@skpm/fs";
import dialog from "@skpm/dialog";
import { spawnSync } from "@skpm/child_process";
import svgo from "svgo";
import svgoPlugins from "./svgo-plugins";
import UI from "sketch/ui";
import DOM from "sketch/dom";

export function openSettings() {
  
  // Plugin was run from the menu, so let's open the settings window
  const response = dialog.showMessageBoxSync({
    buttons: ["Edit SVGO Settings…", "Reset SVGO Settings", "Cancel"],
    message: "About SVGO Compressor",
    detail: "This Plugin uses SVGO to compress SVG assets exported from Sketch.\n\nIt works automatically whenever you export to SVG, so you don’t need to do anything special. Just work on your design as always, and enjoy smaller & cleaner SVG files.\n\nIf for some reason you’re not happy with the default options, you can edit the svgo.json file in the Application Support folder for Sketch.\n"
  });
  
  if (response === 0) {
    // open the config
    spawnSync("/usr/bin/open", [svgoJSONFilePath]);
    UI.alert("SVGO Compressor", "Opening config file in default editor...");
  } else if (response === 1) {
    // reset config
    fs.writeFileSync(svgoJSONFilePath, JSON.stringify(require("./defaultConfig"), null, "  "), "utf8");
    UI.message("SVGO Compressor configuration has been reset");
  }
}

export function svgCopyCompressed(context) {
  const svgCompressor = setupSVGO();
  
  const document = DOM.getSelectedDocument();
  const selectedLayers = document.selectedLayers;
  const selectedCount = selectedLayers.length;
  
  if (selectedCount === 0) {
    return UI.alert("SVGO Compressor", "No layers selected");
  }
  if (selectedCount > 1) {
    return UI.alert("SVGO Compressor", "Please select exactly one layer");
  }
  
  const buffer = DOM.export(selectedLayers.layers[0], {
    formats: "svg",
    output: false
  });
  
  const svgString = buffer.toString();
  
  return svgCompressor.optimize(svgString).then(result => {
      
      const pasteBoard = NSPasteboard.generalPasteboard();
      pasteBoard.declareTypes_owner([NSPasteboardTypeString], null);
      pasteBoard.setString_forType(result.data, NSPasteboardTypeString);
      
      UI.message("Copied optimized SVG to clipboard");
      
    })
    .catch((err) => {
      log(err);
      UI.message(err.message);
    });
}

function setupSVGO() {
  const svgoJSON = getConfig();
  
  if (typeof svgoJSON.enabled !== "undefined" && !svgoJSON.enabled) {
    return;
  }
  
  const floatPrecision = typeof svgoJSON.floatPrecision !== "undefined"
    ? Number(svgoJSON.floatPrecision)
    : undefined;
  
  const parsedSVGOPlugins = [];
  svgoJSON.plugins.forEach(item => {
    if (typeof item.enabled !== "undefined" && !item.enabled) {
      return;
    }
    let plugin = svgoPlugins[item.name];
    if (item.path) {
      try {
        const loadedPlugin = coscript.require(path.join(String(MSPluginManager.mainPluginsFolderURL().path()), item.path));
        
        // loadedPlugin is an NSDictionary so if we try to set something on it,
        // it will crash. Instead we move the values to a proper JS object.
        var keys = Object.keys(loadedPlugin);
        plugin = {};
        Object.keys(loadedPlugin).forEach((k) => { plugin[k] = loadedPlugin[k]; });
        if (loadedPlugin.params) {
          plugin.params = {};
          Object.keys(loadedPlugin.params).forEach((k) => { plugin.params[k] = loadedPlugin.params[k]; });
        }
      } catch (err) {
        log(err);
      }
    }
    if (!plugin) {
      log("Plugin not found: " + (item.name || item.path));
      return;
    }
    if (svgoJSON.debug) log("Enabled plugin: " + (item.name || item.path));
    plugin.pluginName = item.name;
    plugin.active = true;
    if (plugin.params) {
      // Plugin supports params
      
      // Set floatPrecision across all the plugins
      if (floatPrecision && "floatPrecision" in plugin.params) {
        plugin.params.floatPrecision = floatPrecision;
      }
      if (svgoJSON.debug) log("—› default params: " + JSON.stringify(plugin.params, null, 2));
    }
    if (item.params != null) {
      if (typeof plugin.params === "undefined") {
        plugin.params = {};
      }
      for (var attrname in item.params) {
        plugin.params[attrname] = item.params[attrname];
      }
      if (svgoJSON.debug) log("—› resulting params: " + JSON.stringify(plugin.params, null, 2));
    }
    parsedSVGOPlugins.push([plugin]);
  });
  
  if (typeof svgoJSON.full === "undefined") { svgoJSON.full = true; }
  if (typeof svgoJSON.multipass === "undefined") { svgoJSON.multipass = true; }
  if (typeof svgoJSON.pretty === "undefined") { svgoJSON.pretty = true; }
  if (typeof svgoJSON.indent === "undefined") { svgoJSON.indent = 2; }
  
  const svgCompressor = new svgo({
    full: svgoJSON.full,
    js2svg: {
      pretty: svgoJSON.pretty,
      indent: svgoJSON.indent
    },
    plugins: parsedSVGOPlugins,
    multipass: svgoJSON.multipass
  });
  
  if (svgoJSON.debug) log("Let‘s go…");
  
  return svgCompressor;
}

export function compress(context) {
  
  var exports = context.actionContext.exports;
  var filesToCompress = [];
  for (var i = 0; i < exports.length; i++) {
    var currentExport = exports[i];
    if (currentExport.request.format() == "svg") {
      filesToCompress.push(currentExport.path);
    }
  }
  
  if (filesToCompress.length > 0) {
    var svgCompressor = setupSVGO();
    
    let originalTotalSize = 0;
    let compressedTotalSize = 0;
    
    Promise.all(filesToCompress.map(currentFile => {
      const svgString = fs.readFileSync(currentFile, "utf8");
      originalTotalSize += svgString.length;
      
      // Hacks for plugins
      svgCompressor.config.plugins.forEach(([plugin]) => {
        // cleanupIDs
        if (plugin.pluginName == "cleanupIDs") {
          const parts = currentFile.split("/");
          var prefix = parts[parts.length - 1].replace(".svg", "").replace(/\s+/g, "-").toLowerCase() + "-";
          if (svgoJSON.debug) log("Setting cleanupIDs prefix to: " + prefix);
          plugin.params["prefix"] = prefix;
        }
      });
      
      return svgCompressor.optimize(svgString).then(result => {
        compressedTotalSize += result.data.length;
        fs.writeFileSync(currentFile, result.data, "utf8");
      });
    })).then(() => {
        var compressionRatio = (100 - ((compressedTotalSize * 100) / originalTotalSize)).toFixed(2);
        var msg = filesToCompress.length + " SVG files compressed by " + compressionRatio + "%, from " + originalTotalSize + " bytes to " + compressedTotalSize + " bytes.";
        log(msg);
        UI.message(msg);
      })
      .catch((err) => {
        log(err);
        UI.message(err.message);
      });
  }
}
