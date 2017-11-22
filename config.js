const
  autoprefixer = require('autoprefixer');

module.exports = {
  /**
   * Source/destination paths for content types
   * @type object
   */
  paths: {
    src: {
      all: './src/**/*',
      sass: './src/sass/**/*.scss',
      css: './app/assets/css/**/*.scss',
      twig: ['./src/template/**/*.twig', '!./src/template/includes/*'],
      twigWatch: ['./src/template/**/*.twig'],
      img: './src/img/**/*.{png,jpg,gif}',
      js: {
        'app.js': [
          './src/js/app.js'
        ]
      },
      svg: './src/svg/**/*.svg',
    },
    dest: {
      root: './app',
      assets: './app/assets',
      css: './app/assets/css',
      twig: './app',
      img: './app/assets/img',
      js: './app/assets/js',
      svg: './app/assets/img/svg'
    },
    server: {
      assets: '/assets/',
      js: '/assets/js/',
      css: '/assets/css/',
      deploy: './app/**'
    }
  },

  /**
   * Environment configuration, allows for different parameters for dev & production builds.
   * Other environments get merged with the 'default' object, so common options can be defined there.
   * @type object
   */
  default: {
    sass: {
      precision: 10,
      outputStyle: 'expanded'
    },
    css: [
      autoprefixer([
        'last 2 versions'
      ])
    ]
  },

  // Dev-only variables
  dev: {
    js: {
      mangle: false,
      output: {
        beautify: true
      },
      compress: {}
    }
  },

  // UAT-only variables
  uat: {
    js: {
      mangle: true,
      beautify: false,
      compress: {
        drop_console:  true
      }
    },
    sass: {
      precision: 10,
      outputStyle: 'compressed'
    }
  },

  // Production-only variables
  prod: {
    js: {
      mangle: true,
      beautify: false,
      compress: {
        drop_console:  true
      }
    },
    sass: {
      precision: 10,
      outputStyle: 'compressed'
    }
  }
};
