'use strict';

var gulp = require('gulp'),
    path = require('path'),
    stylish = require('jshint-stylish'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins();

var paths = {
  test: ['src/**/*.js', 'test/spec/**/*.js'],
};

gulp.task('test', function () {
  return gulp.src(paths.test)
    .pipe(plugins.karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }))
    .on('error', function (err) {
      throw err;
    });
});
gulp.task('jshint', function () {
  gulp.src('./src/**/*.js')
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter(stylish));
});
gulp.task('minify', function () {
  gulp.src('src/**/*.js')
    .pipe(plugins.uglify())
    .pipe(plugins.concat('plexi.js'))
    .pipe(gulp.dest('app/scripts/'));
});

gulp.task('stylus', function () {
  gulp.src('app/styles/**/*.styl')
    .pipe(plugins.stylus())
    .pipe(plugins.concat('app.css'))
    .pipe(gulp.dest('app/styles/'));
});

gulp.task('clean', function () {
  gulp.src('dist/**/*.*', {read: false})
    .pipe(plugins.clean());
});

gulp.task('usemin', function () {
  gulp.src('app/**/*.html')
    .pipe(plugins.usemin({
      css: [plugins.minifyCss(), 'concat'],
      //html: [plugins.minifyHtml({empty: true})],
      js: [plugins.uglify()]
    }))
    .pipe(gulp.dest('dist/'));
});

gulp.task('build', ['clean', 'stylus', 'minify', 'jshint'], function () {
  // Copy over HTML
  gulp.src('app/views/**/*.html')
    .pipe(gulp.dest('dist/views/'));
  gulp.src('app/scripts/**/*.js')
    .pipe(gulp.dest('dist/scripts/'));
  gulp.src('app/images/**/*.{png,bmp}')
    .pipe(gulp.dest('dist/images'));
  gulp.src(['app/views/header.html', 'app/views/footer.html'])
    .pipe(plugins.usemin({
      assetsDir: 'app/',
      outputRelativePath: '../',
      css: [plugins.minifyCss(), 'concat'],
      html: [plugins.minifyHtml({empty: true})],
      js: [plugins.uglify()]
    }))
    .pipe(gulp.dest('dist/views'));
  gulp.src('app/bower_components/bootstrap/dist/fonts/*.*')
    .pipe(gulp.dest('dist/fonts'));
    //.pipe(gulp.dest('dist/views'))

});

gulp.task('jsdoc', function () {
  gulp.src('doc/**/*.*', {read: false})
    .pipe(plugins.clean());
  gulp.src('./src/**/*.js')
    .pipe(plugins.jsdoc('./doc'));
});

gulp.task('server', ['stylus', 'minify'], function () {
  process.env.NODE_ENV = 'development';
  require('./app').listen(3000);
  plugins.livereload.listen();
  gulp.watch('app/styles/**/*.styl', ['stylus']);
  gulp.watch('src/**/*.js', ['minify']);
  gulp.watch(['app/scripts/**/*.js', 'app/views/**/*.html', 'app/styles/app.css']).on('change', plugins.livereload.changed);

});

gulp.task('default', ['jsdoc', 'build']);
