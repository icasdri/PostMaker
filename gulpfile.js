var gulp = require('gulp');
var connect = require('gulp-connect');
var gulpif = require('gulp-if');
var merge2 = require('merge2');
var inject = require('gulp-inject');
var removeCode = require('gulp-remove-code');
var concat = require('gulp-concat');
var riot = require('gulp-riot');
var mainBowerFiles = require('main-bower-files');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var surge = require('gulp-surge');

var args = require('minimist')(process.argv.slice(2));
var PROD = args.production;
var TARGET = PROD ? 'dist/' : 'dev/';

gulp.task('build', function() {
  var libs = gulp.src(mainBowerFiles())
    .pipe(gulp.dest(TARGET + 'libs'));

  var tags = gulp.src('tags/*')
    .pipe(riot())

  var app = gulp.src('app.js')
  var workers = gulp.src('workers/*.js')
  var route = gulp.src('route.js');

  var js_files = merge2(tags, app, workers, route)
    .pipe(gulpif(PROD, uglify()))
    .pipe(gulpif(PROD, concat('all.js')))

  gulp.src('index.html')
    .pipe(inject(js_files, {relative: true, ignorePath: TARGET}))
    .pipe(inject(libs, {name: 'libs', relative: true, ignorePath: TARGET}))
    .pipe(removeCode({ _keep_in_prod: !PROD, _keep_in_dev: PROD}))
    .pipe(gulpif(PROD, htmlmin({removeComments: true, collapseWhitespace: true})))
    .pipe(gulp.dest(TARGET));

  if (PROD) {
    js_files.pipe(gulp.dest(TARGET));
  } else {
    app.pipe(gulp.dest(TARGET));
    tags.pipe(gulp.dest(TARGET + 'tags'));
    workers.pipe(gulp.dest(TARGET + 'workers'));
    route.pipe(gulp.dest(TARGET));
  }
});

gulp.task('default', ['build']);

gulp.task('server', ['build'], function() {
  gulp.watch(['tags/*', 'app.js', 'index.html'], ['build']);
  connect.server({
    root: TARGET,
    port: args.port ? args.port : 8000
  });
});

gulp.task('deploy', ['build'], function() {
    require('sleep').sleep(10);
    surge({
        project: TARGET,
        domain: 'postmaker.surge.sh'
    });
});
