var gulp = require('gulp');

gulp.task('static', function() {
  return gulp.src('static/**')
    .pipe(gulp.dest('../pi-nav/static'));
});
