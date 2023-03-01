'use strict'

import gulp from 'gulp'
import { deleteAsync, deleteSync }  from 'del'
import browserSync from 'browser-sync'
import gulpFileInclude from 'gulp-file-include'
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
import minify from 'gulp-minify'
import hash from 'gulp-hash-src'
const mainSass = gulpSass(sass);
const isProduction = process.env.NODE_ENV === 'production'

const paths = {
    styles: {
      main: 'src/styles/scss/main.scss',
      src: 'src/styles/scss/**/*.scss',
      dest: 'dist/styles/'
    },
    scripts: {
      src: 'src/scripts/**/*.js',
      dest: 'dist/scripts/'
    },
    html: {
        partials:'src/partials/**/*.html',
        src: 'src/index.html',
        dest: 'dist/'
      },
    assets: {
        src: 'src/assets/',
        dest: 'dist/assets/'
      },
  };

// Assets

export const assets = () => {
  return gulp.src(`${paths.assets.src}**`)
    .pipe(gulp.dest(paths.assets.dest))
}

export const watchResourses = () =>{
  deleteSync(`${paths.assets.dest}**`)
  return gulp.src(`${paths.assets.src}**`)
    .pipe(gulp.dest(paths.assets.dest))
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
        //.pipe(hash({build_dir:paths.html.dest,src_path:paths.html.src,exts:[".js"]}))
        .pipe(gulp.dest(paths.html.dest))
        .pipe(browserSync.stream())
}

export const clean = () => {
  return deleteAsync(['dist/'])
}

//CSS

export const styles = () => {
  return gulp.src(paths.styles.main, {sourcemaps:isProduction ? false : true})
    .pipe(mainSass({ outputStyle: isProduction? 'compressed' : 'expanded'}))
    .pipe(autoPrefixer({
      cascade: false,
      grid: true,
      overrideBrowserslist: ["last 5 versions"]
    }))
    .pipe(gulp.dest(paths.styles.dest),{sourcemaps:isProduction? '.' : false})
    .pipe(browserSync.stream());
} 

//JS

export const scripts = () => {
  return gulp.src(paths.scripts.src,{sourcemaps:true})
    .pipe(gulpIf(isProduction, minify({
      ext:{
          min:'.js'
      },
      noSource:true
    })))
    .pipe(gulp.dest(paths.scripts.dest, {sourcemaps:'/'}))
    .pipe(browserSync.stream())
}

//Images 

export const images = () => {
  return gulp.src('src/assets/images/**.{jpg,jpeg,png}')
    .pipe(webp())
    .pipe(gulp.dest('dist/assets/images/'))
    .pipe(gulp.src('src/assets/images/**.{jpg,jpeg,png,svg}'))
    .pipe(imagemin([
      mozjpeg({quality: 75, progressive: true}),
      optipng()
    ]))
    .pipe(gulp.dest('dist/assets/images/'))
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

export default gulp.series(clean, gulp.parallel(htmlInclude, styles, assets, scripts), watchFiles)
export const build = gulp.series(clean, assets, gulp.parallel(htmlInclude, styles, scripts, images)) 
