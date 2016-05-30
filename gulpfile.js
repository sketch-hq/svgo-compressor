var async       = require('async');
var babelify    = require('babelify');
var browserify  = require('browserify');
var del         = require('del');
var expandTilde = require('expand-tilde');
var fs          = require('fs');
var fse         = require('fs-extra');
var gulp        = require('gulp');
var path        = require('path');
var runSequence = require('run-sequence');
var source      = require('vinyl-source-stream');
var spawn       = require("gulp-spawn");

var SKETCH_PLUGINS_FOLDER = path.join(expandTilde('~'), '/Library/Application Support/com.bohemiancoding.sketch3/Plugins');

var ManifestProcessorOptions = {
  pluginManifestDescriberName: 'SketchPlugin',
  startingManifestTag: '__$begin_of_manifest_\n',
  endingManifestTag: '__$end_of_manifest_\n',
  scriptFileName: 'plugin.js',
  globalVarName: '__globals'
};

var currentManifest = {};


function extractManifestObject() {
  var data = fs.readFileSync(path.join(__dirname, 'build', ManifestProcessorOptions.scriptFileName), 'utf8');
  var startTag = ManifestProcessorOptions.startingManifestTag;
  var endTag = ManifestProcessorOptions.endingManifestTag;

  var startIndex = data.indexOf(startTag);
  var endIndex = data.indexOf(endTag);

  if (startIndex === -1 || endIndex === -1) {
    return;
  }

  return JSON.parse(data.substring(startIndex + startTag.length, endIndex));
}

gulp.task('clean', function () {
  return del(['build', 'dist', 'SVGO Compressor.sketchplugin']);
});

gulp.task('prepare-manifest', function (callback) {
  var manifest = extractManifestObject();
  fse.outputJsonSync(path.join(__dirname, 'build/manifest.json'), manifest);
  currentManifest = manifest;
  callback(null);
});

gulp.task('prepare-folders', function (callback) {
  async.parallel({
    build: function (callback) {
      fse.ensureDir(path.join(__dirname, 'build'), callback);
    },
    dist: function (callback) {
      fse.ensureDir(path.join(__dirname, 'dist'), callback);
    }
  }, callback);
});


gulp.task('assemble-plugin-bundle', function (callback) {

  function normalizePluginFileName(name) {
    console.log("Plugin name:");
    console.log(name);
    return name;
  }

  var bundlePath = path.join(__dirname, 'dist', normalizePluginFileName(currentManifest.name) + '.sketchplugin');

  async.parallel({
    manifest: function (callback) {
      fse.outputJson(path.join(bundlePath, 'Contents', 'Sketch', 'manifest.json'), currentManifest, callback);
    },
    runtime: function (callback) {
      var script = fs.readFileSync(path.join(__dirname, 'build', ManifestProcessorOptions.scriptFileName), 'utf8');
      script = ["var " + ManifestProcessorOptions.globalVarName + " = this;", script].join("");

      fse.outputFile(path.join(bundlePath, 'Contents', 'Sketch', ManifestProcessorOptions.scriptFileName), script, callback);
    }
  }, function (err, data) {
    callback(null);
  });
});

gulp.task('assemble-plugin-resources', function (callback) {
  function normalizePluginFileName(name) {
    return name;
  }

  return gulp.src('src/resources/**/*.*')
    .pipe(gulp.dest(path.join(__dirname, 'dist', normalizePluginFileName(currentManifest.name) + '.sketchplugin', 'Contents/Resources')));
});

gulp.task('install-plugin', function () {
  return gulp.src("dist/**/*.*")
    .pipe(gulp.dest(SKETCH_PLUGINS_FOLDER));
});

gulp.task('build', function (callback) {
  runSequence('clean', 'prepare-folders', 'bundle', 'prepare-manifest', 'assemble-plugin-bundle', 'assemble-plugin-resources', 'install-plugin', callback);
});

gulp.task('bundle', function () {
  var filePath = './src/plugin.js';
  var extensions = ['.js'];

  var bundler = browserify({
    entries: [filePath],
    extensions: extensions,
    debug: false
  });

  bundler.transform(babelify.configure({
    presets: ["es2015"],
    plugins: [["babel-plugin-sketch-manifest-processor", ManifestProcessorOptions]]
  }));

  return bundler.bundle()
    .on('error',(function(arg) {
      console.log(arg.message);
    }))
    .pipe(source(ManifestProcessorOptions.scriptFileName))
    .pipe(gulp.dest('./build/'));
});


gulp.task('watch', function () {
  runSequence('build', function () {
    gulp.watch('./src/**/*.*', function () {
      console.log("Watching...");
      runSequence('clean', 'build', function () {
        console.log("Rebuild complete!");
      });
    });
  });
});

gulp.task('default', function (callback) {
  runSequence('build', callback);
});