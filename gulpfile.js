const gulp = require('gulp'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    twig = require('gulp-twig'),
    imagemin = require('gulp-imagemin'),
    uglify = require('gulp-uglify'),
    svgmin = require('gulp-svgmin'),
    newer = require('gulp-newer'),
    argv = require('yargs').argv,
    config = require('./config'),
    express = require('express'),
    plumber = require('gulp-plumber'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    sassLint = require('gulp-sass-lint'),
    path = require('path'),
    rev = require('gulp-rev'),
    fs = require('fs'),
    revDel = require('rev-del'),
    sequence = require('gulp-sequence'),
    opn = require('opn'),
    del = require('del');

/**
 * Look up the task config for the current environment.
 * Environment options are merged with the defaults specified above.
 *
 * Config is defined in config.js
 *
 * @param  string   The name of the task (e.g. 'sass')
 *
 * @return object   The task options, or an empty object if none can be found
 */
const getTaskConfig = function(task) {
    'use strict';

    var env = argv.env || 'dev';
    var options = config.default[task] || {};

    if (typeof config[env][task] !== 'undefined') {
        options = Object.assign(options, config[env][task]);
    }

    return options;
};

/**
 * Read in the asset manifest generated by gulp-rev and
 * rewrite the paths depending on the environment.
 */
const getAssetManifest = function() {
  'use strict';

  // Read in the asset manifest to get the hashed file names
  var manifest = {};

  try {
    manifest = JSON.parse(fs.readFileSync(config.paths.dest.assets + '/rev-manifest.json', 'utf8'));
  }
  catch (e) {}

  var env = argv.env || 'dev';

  // Rewrite asset paths depending on the environment.
  // This allows you to use {{ manifest['filename.css']}} in Twig without worrying about which file it should use
  for (var key in manifest) {
    if (manifest.hasOwnProperty(key)) {
      var type = path.extname(key).substr(1);

      if (env !== 'dev') {
        manifest[key] = config.paths.server.assets + manifest[key];
      }
      else {
        manifest[key] = config.paths.server[type] + key;
      }
    }
  }

  return manifest;
};

/**
 * LiveReload web server
 */
gulp.task('serve', ['publish:build'], function() {
  'use strict';

  livereload.listen();

  var server = express();

  // Allow files to be served without the .html extension
  server.use(express.static(__dirname + '/' + config.paths.dest.root + '/', {
    extensions: ['html']
  }));

  server.get('/*', function(req, res){
      res.sendFile(__dirname + '/' + config.paths.dest.root + '/index.html');
  });

  server.listen(8080);

  // Navigate to the host
  opn('http://localhost:8080/');

  gulp.start('watch');
});

/**
 * Gulp tasks
 *
 * We use gulp-newer to avoid time consuming rebuilds of assets which haven't
 * changed. This is most noticable when using the img task.
 */
gulp.task('svg', function() {
  'use strict';

  return gulp.src(config.paths.src.svg)
    .pipe(plumber())
    .pipe(newer(config.paths.dest.svg))
    .pipe(svgmin(getTaskConfig('svg')))
    .pipe(gulp.dest(config.paths.dest.svg))
    .pipe(livereload());
});

/**
 * Minify and concatenate javascript
 */
gulp.task('js', function() {
  'use strict';

  for(var out in config.paths.src.js) {
    if (config.paths.src.js.hasOwnProperty(out)) {
      gulp.src(config.paths.src.js[out])
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(uglify(getTaskConfig('js')))
        .pipe(concat(out))
        .pipe(gulp.dest(config.paths.dest.js))
        .pipe(livereload());
    }
  }
});

/**
 * Minify images
 */
gulp.task('img', function() {
  'use strict';

  return gulp.src(config.paths.src.img)
    .pipe(plumber())
    .pipe(newer(config.paths.dest.img))
    .pipe(imagemin(getTaskConfig('img')))
    .pipe(gulp.dest(config.paths.dest.img))
    .pipe(livereload());
});

/**
 * Compile twig templates into HTML
 */
gulp.task('twig', ['revision'], function() {
  'use strict';

  var twigConfig = getTaskConfig('twig');

  twigConfig.data = Object.assign(twigConfig.data || {}, {
    manifest: getAssetManifest(),
    env: argv.env || 'dev'
  });

  return gulp.src(config.paths.src.twig)
    .pipe(plumber())
    .pipe(newer(config.paths.dest.twig))
    .pipe(twig(twigConfig))
    .pipe(gulp.dest(config.paths.dest.twig))
    .pipe(livereload());
});

/**
 * Compile SASS code into CSS
 */
gulp.task('sass', function() {
  'use strict';

  return gulp.src(config.paths.src.sass)
    .pipe(plumber())
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
    .pipe(sass(getTaskConfig('sass')))
    .pipe(gulp.dest(config.paths.dest.css))
    .pipe(livereload());
});

/**
 * Run PostCSS tasks on the resulting CSS files
 */
gulp.task('css', ['sass'], function() {
  'use strict';

  return gulp.src(config.paths.src.css)
    .pipe(plumber())
    .pipe(postcss(getTaskConfig('css')))
    .pipe(gulp.dest(config.paths.dest.css))
    .pipe(livereload());
});

/**
 * Monitor source files for changes and trigger their tasks
 */
gulp.task('watch', function() {
  'use strict';

  livereload.listen();

  gulp.watch(config.paths.src.sass, ['css']);
  gulp.watch(config.paths.src.twigWatch, ['twig']);
  gulp.watch(config.paths.src.img, ['img']);
  gulp.watch(config.paths.src.svg, ['svg']);

  for(var out in config.paths.src.js) {
    if (config.paths.src.js.hasOwnProperty(out)) {
      gulp.watch(config.paths.src.js[out], ['js']);
    }
  }
});

/**
 * Version assets for cache busting
 */
gulp.task('revision', function() {
  'use strict';

  return gulp.src([config.paths.dest.js + '/*.js', config.paths.dest.css + '/*.css'])
    .pipe(rev())
    .pipe(gulp.dest(config.paths.dest.assets))
    .pipe(rev.manifest())
    .pipe(revDel({ dest: config.paths.dest.assets }))
    .pipe(gulp.dest(config.paths.dest.assets));
});

/**
 * Clean up the output folder
 */
gulp.task('clean', function() {
  'use strict';

  return del(['app/**']);
});

/**
 * For publishing we need to build in a specific order so that asset revisions can be used
 */
gulp.task('publish:build', sequence('clean', 'build', 'revision', 'twig'));

/**
 * Generic build task to run everything
 */
gulp.task('build', ['sass', 'css', 'twig', 'img', 'svg', 'js'], function() {

});

gulp.task('default', ['build'], function() {});
