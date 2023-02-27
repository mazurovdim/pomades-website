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
import imagemin from 'gulp-imagemin'
import mozjpeg from 'imagemin-mozjpeg'
import optipng  from 'imagemin-optipng'
import webp from 'gulp-webp'
import htmlmin from 'gulp-htmlmin'
import gulpIf from 'gulp-if'
import jsUglify from 'gulp-uglify'
import minify from 'gulp-minify'
const mainSass = gulpSass(sass);
const isProduction = process.env.NODE_ENV === 'production'

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
        .pipe(gulpIf(isProduction, htmlmin()))
        .pipe(gulp.dest(paths.html.dest))
        .pipe(browserSync.stream())
}

export const clean = () => {
  return deleteAsync(['dist/'])
}

//CSS

export const styles = () => {
  return gulp.src('src/scss/main.scss', {sourcemaps:true})
    .pipe(mainSass({ outputStyle: isProduction? 'compressed' : 'expanded'}))
    .pipe(autoPrefixer({
      cascade: false,
      grid: true,
      overrideBrowserslist: ["last 5 versions"]
    }))
    .pipe(gulp.dest(paths.styles.dest),{sourcemaps:'.'})
    .pipe(browserSync.stream());
} 

//JS

export const scripts = () => {
  return gulp.src(paths.scripts.src)
    .pipe(gulpIf(isProduction, minify({
      ext:{
          min:'.js'
      },
      noSource:true
    })))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream())
}

//Images 

export const images = () => {
  return gulp.src('./public/assets/images/**.{jpg,jpeg,png}')
    .pipe(webp())
    .pipe(gulp.dest('./dist/assets/images/'))
    .pipe(gulp.src('./public/assets/images/**.{jpg,jpeg,png,svg}'))
    .pipe(imagemin([
      mozjpeg({quality: 75, progressive: true}),
      optipng()
    ]))
    .pipe(gulp.dest('./dist/assets/images/'))
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
    gulp.watch([paths.scripts.src], scripts)
}

export default gulp.series(clean, htmlInclude, styles, resourses, scripts, watchFiles)
export const build = gulp.series(clean, resourses, htmlInclude, styles, scripts, images)
