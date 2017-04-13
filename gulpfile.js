'use strict';

var gulp = require('gulp');

var config = {
    htmlSource: '*.html',
    cssSource: 'src/css/style.css',
    jsSource: 'src/js/*.js'
};


gulp.task('publish-js', function() {
	return gulp.src(['node_modules/jquery/dist/jquery.min.js', 'node_modules/knockout/build/output/knockout-latest.js',	config.jsSource])
		.pipe(gulp.dest('dist/js'));
});

gulp.task('publish-css', function() {
	return gulp.src(['node_modules/bootstrap/dist/css/bootstrap.min.css', config.cssSource])
		.pipe(gulp.dest('dist/css'));
});

gulp.task('publish-fonts', function() {
	return gulp.src('node_modules/bootstrap/dist/fonts/*.*')
		.pipe(gulp.dest('dist/fonts'));
});

gulp.task('publish-html', function() {
	return gulp.src(config.htmlSource)
		.pipe(gulp.dest('dist/'));
});

gulp.task('watch', function() {
    gulp.watch(config.htmlSource, ['publish-html'])
    gulp.watch(config.cssSource, ['publish-css'])
    gulp.watch(config.jsSource, ['publish-js'])
});

gulp.task('default', [ 'publish-js', 'publish-css', 'publish-html', 'publish-fonts']);