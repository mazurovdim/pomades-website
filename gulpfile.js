'use strict'

import gulp from 'gulp'
import { deleteAsync, deleteSync }  from 'del'
import browserSync from 'browser-sync'
import gulpFileInclude from 'gulp-file-include'
import gulpSourcemaps from 'gulp-sourcemaps'
import sass from 'sass'
import gulpSass from 'gulp-sass'
import typograf from 'gulp-typograf'
import autoPrefixer from 'gulp-autoprefixer'
const mainSass = gulpSass(sass);
const build = true

const paths = {
    styles: {
      src: 'src/scss/**/*.scss',
      dest: 'dist/'
    },
    scripts: {
      src: 'src/js/**/*.js',
      dest: 'dist/'
    },
    html: {
        partials:'src/partials/*.html',
        src: 'src/index.html',
        dest: 'dist/'
      },
      resourses: {
        src: 'public/',
        dest: 'dist/'
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
        .pipe(gulpFileInclude({
            prefix: '@@',
            basepath: '@file'
          }))
        .pipe(typograf({ locale: ['ru', 'en-US'] }))
        .pipe(gulp.dest(paths.html.dest))
        .pipe(browserSync.stream())
}

export const clean = () => {
  return deleteAsync(['dist/'])
}

//CSS

export const styles = () => {
  return gulp.src('src/scss/main.scss', {sourcemaps:true})

    .pipe(mainSass())
    .pipe(autoPrefixer({
      cascade: false,
      grid: true,
      overrideBrowserslist: ["last 5 versions"]
    }))
    .pipe(gulp.dest(paths.styles.dest),{sourcemaps:'.'})
    .pipe(browserSync.stream());
} 

// Watcher

export const watchFiles = () => {
    browserSync.init({
      server: {
        baseDir: `dist/`
      },
    });
    gulp.watch([paths.html.partials, paths.html.src], htmlInclude)
    gulp.watch([`${paths.resourses.src}`], { events: 'all' }, watchResourses)
    gulp.watch([paths.styles.src], styles)
}

export default gulp.series(clean, htmlInclude, styles, resourses, watchFiles)