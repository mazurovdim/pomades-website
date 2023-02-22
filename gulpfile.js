'use strict'

import gulp from 'gulp'
import { deleteAsync, deleteSync }  from 'del'
import browserSync from 'browser-sync'
import gulpFileInclude from 'gulp-file-include'
import gulpSourcemaps from 'gulp-sourcemaps'
import sass from 'sass'
import gulpSass from 'gulp-sass'
import typograf from 'gulp-typograf'
const mainSass = gulpSass(sass);

const paths = {
    styles: {
      src: 'src/scss**/*.scss',
      dest: 'dist/build/'
    },
    scripts: {
      src: 'src/js/**/*.js',
      dest: 'dist/build/'
    },
    html: {
        partials:'src/partials/*.html',
        src: 'src/index.html',
        dest: 'dist/build/'
      },
      resourses: {
        src: 'src/resourses/',
        dest: 'dist/build/resourses/'
      },
  };


export const resourses = () => {
  return gulp.src(`${paths.resourses.src}**`)
    .pipe(gulp.dest(paths.resourses.dest))
}

export const watchResourses = () =>{
  deleteSync(`${paths.resourses.dest}**`)
  return gulp.src(`${paths.resourses.src}**`)
    .pipe(gulp.dest(paths.resourses.dest))
    .pipe(browserSync.stream())
}

// HTML

export const htmlInclude = () => {
  return gulp.src(paths.html.src)
        .pipe(gulpSourcemaps.init())
        .pipe(gulpFileInclude({
            prefix: '@@',
            basepath: '@file'
          }))
        .pipe(typograf({ locale: ['ru', 'en-US'] }))
        .pipe(gulpSourcemaps.write())
        .pipe(gulp.dest(paths.html.dest))
        .pipe(browserSync.stream())
}

export const clean = () => {
  return deleteAsync(['dist/build/'])
}

// Watcher

export const watchFiles = () => {
    browserSync.init({
      server: {
        baseDir: `dist/build/`
      },
    });
    gulp.watch([paths.html.partials, paths.html.src], htmlInclude)
    gulp.watch([`${paths.resourses.src}`], { events: 'all' }, watchResourses)
}

export default gulp.series(clean, htmlInclude, resourses, watchFiles)