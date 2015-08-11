var gulp = require('gulp');

var jasmine = require('gulp-jasmine');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');

var source = [
  'gulpfile.js',
  'lib/**/*.js',
  'spec/**/*.js'
];

gulp.task('jscs', function () {
  return gulp.src(source)
    .pipe(jscs());
});

gulp.task('jshint', function () {
  return gulp.src(source)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jasmine', function () {
  var specs = ['spec/**/*.spec.js'];
  return gulp.src(specs)
    .pipe(jasmine({
      includeStackTrace: true,
      verbose: true
    }));
});

gulp.task('watch', function () {
  gulp.watch(source, ['default']);
});

gulp.task('standards', ['jshint', 'jscs']);
gulp.task('test', ['jasmine']);
gulp.task('default', ['jasmine', 'jshint', 'jscs']);
