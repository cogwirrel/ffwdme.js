var browserSync = require('browser-sync');
var gulp        = require('gulp');

gulp.task('browserSync', ['build'], function() {
  browserSync.init(['../pi-nav/static/**'], {
    server: {
      baseDir: ['../pi-nav/static', 'src']
    }
  });
});
