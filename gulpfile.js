'use strict';

const gulp = require( 'gulp' );
const mocha = require( 'gulp-mocha' );

gulp.task( 'test', () => {
    return gulp.src([ 'src/**/*.js', 'test/**/*.js' ], { read: false })
    .pipe( mocha())
    .once( 'end', () => process.exit());
});
