var gulp = require('gulp');
var connect = require('gulp-connect');
var gulpif = require('gulp-if');
var merge2 = require('merge2');
var inject = require('gulp-inject');
var concat = require('gulp-concat');
var riot = require('gulp-riot');
var mainBowerFiles = require('main-bower-files');
var uglify = require('gulp-uglify');

var args = require('minimist')(process.argv.slice(2));
var PROD = args.production;
var TARGET = PROD ? 'dist/' : 'dev/';

gulp.task('build', function() {

  gulp.src(mainBowerFiles())
    .pipe(gulp.dest(TARGET + 'libs'));

  var tags = gulp.src('tags/*')
    .pipe(riot())

  var app = gulp.src('app.js')

  var js_files = merge2(app, tags)
    .pipe(gulpif(PROD, uglify()))
    .pipe(gulpif(PROD, concat('all.js')))

  gulp.src('index.html')
    .pipe(inject(js_files, {relative: true, ignorePath: TARGET}))
    .pipe(gulp.dest(TARGET));

  if (PROD) {
    js_files.pipe(gulp.dest(TARGET));
  } else {
    app.pipe(gulp.dest(TARGET));
    tags.pipe(gulp.dest(TARGET + 'tags'));
  }

});

gulp.task('default', ['build']);

gulp.task('server', function() {
  connect.server({
    root: TARGET,
    port: args.port ? args.port : 8000
  });
});
