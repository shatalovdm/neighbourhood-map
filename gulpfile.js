'use strict';

var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var minify = require('gulp-minify');
var htmlmin = require('gulp-htmlmin');

var config = {
    htmlSource: '*.html',
    cssSource: 'src/css/*.css',
    jsSource: 'src/js/*.js'
};
gulp.task('publish-frameworks', function() {
	return gulp.src(['node_modules/knockout/build/output/knockout-latest.js', 'node_modules/bootstrap/dist/css/bootstrap.min.css.map'])
        .pipe(gulp.dest('dist/lib'));
});

gulp.task('minify-js', function() {
	return gulp.src(config.jsSource)
		.pipe(minify({
            ext:{
                min:'.min.js'
            },
            noSource: true
        }))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('minify-css', function() {
	return gulp.src(config.cssSource)
		.pipe(sourcemaps.init())
        .pipe(cleanCSS())
        .pipe(sourcemaps.write({addComment: false}))
        .pipe(rename(function (path) {
            if(path.extname === '.css') {
                path.basename += '.min';
            }
        }))
		.pipe(gulp.dest('dist/css'));
});

gulp.task('minify-html', function() {
	return gulp.src(config.htmlSource)
		.pipe(htmlmin({collapseWhitespace: true}))
    	.pipe(gulp.dest('dist'));
});

gulp.task('publish-images', function() {
    return gulp.src('src/img/*')
        .pipe(gulp.dest('dist/img'))
});


gulp.task('watch', function() {
    gulp.watch(config.htmlSource, ['minify-html'])
    gulp.watch(config.cssSource, ['minify-css'])
    gulp.watch(config.jsSource, ['minify-js'])
});

gulp.task('default', [ 'minify-html', 'minify-css', 'minify-js', 'publish-frameworks', 'publish-images']);
