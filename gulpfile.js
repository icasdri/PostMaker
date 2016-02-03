var gulp = require('gulp');
var riot = require('gulp-riot');
var mainBowerFiles = require('main-bower-files');

gulp.task('riot', function() {
  return gulp.src('tags/*')
    .pipe(riot())
    .pipe(gulp.dest('dist/tags'));
});

gulp.task('bower', function() {
  return gulp.src(mainBowerFiles())
    .pipe(gulp.dest('dist/libs'));
});

gulp.task('app-files', function() {
  return gulp.src(['app.js', 'index.html'])
    .pipe(gulp.dest('dist'))
})

gulp.task('default', ['bower', 'riot', 'app-files']);
