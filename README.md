## SPA boilerplate

This is a boilerplate project for static site builds and single page apps. It is heavily opinionated and designed to rapidly build front-end templates in isolation, typically before they are integrated with a CMS or back-end system.

Based on Gulp, it performs the following tasks;

* Compiling CSS with SASS and PostCSS (autoprefixer + cssnano)
* Compiling HTML templates from Twig partials
* Minifying and concatenating Javascript using Uglify
* Compressing images using imagemin and svgmin
* Linting SASS and Javascript
* Provides a simple livereload web server for development

### Getting started

1.  Clone the project

    `git clone git@github.com:andrewjoll/static-boilerplate.git .`

2.  Install the dependencies.

    `npm install`

3.  Start the server

    `gulp serve`

4.  Navigate to the site

    `http://localhost:8080/`

If you'd prefer to use your own web server, you can use `gulp watch` instead.

### Configuration

When building manually you can specify a config environment. This is done with the `env` parameter.

E.g; `gulp build --env=prod`

Configuration is defined per-task in `config.js` and additional environments can be created if required.

```js
dev: {
    js: {
        mangle: false,
        output: {
            beautify: true
        },
        compress: {}
    }
},
prod: {
    js: {
        mangle: true,
        beautify: false,
        compress: {
            drop_console:  true
        }
    }
}
```
