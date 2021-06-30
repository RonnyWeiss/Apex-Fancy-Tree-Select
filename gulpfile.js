/*
npm install -g gulp-cli
npm install gulp --save-dev
npm install gulp-concat --save-dev
npm install gulp-uglify --save-dev
npm install gulp-uglifycss --save-dev
*/

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');

function concatmainjs() {
  return gulp.src([
    './js/lib/*.js',
    './js/*.js'])
    .pipe(concat('fancytree.pkgd.min.js'))
    .pipe(uglify().on('error', function (e) { console.log(e); }))
    .pipe(gulp.dest('./build/'));
}

function concatcss() {
  return gulp.src('./css/*.css')
    .pipe(concat({ path: 'fancytree.pkgd.min.css' }))
    .pipe(uglifycss({ "uglyComments": true }))
    .pipe(gulp.dest('./build/'))
}

exports.concatmainjs = concatmainjs;
exports.concatcss = concatcss;