'use strict';

var gulp = require('gulp');


gulp.task('publish-js', function() {
	return gulp.src(['node_modules/jquery/dist/jquery.min.js', 'node_modules/knockout/build/output/knockout-latest.js'])
		.pipe(gulp.dest('dist/js'));
});

gulp.task('publish-css', function() {
	return gulp.src('node_modules/bootstrap/dist/css/bootstrap.min.css')
		.pipe(gulp.dest('dist/css'));
});

gulp.task('publish-html', function() {
	return gulp.src('*.html')
		.pipe(gulp.dest('dist/'));
});


gulp.task('default', [ 'publish-js', 'publish-css', 'publish-html']);