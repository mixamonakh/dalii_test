const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync');
const concat = require('gulp-concat');
const uglify = require('gulp-uglifyjs');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const cache = require('gulp-cache');
const autoprefixer = require('gulp-autoprefixer');
const webp = require('gulp-webp');
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const nunjucksRender = require('gulp-nunjucks-render'); // Добавлено для Nunjucks
// const gulpIf = require('gulp-if');
const ignore = require('gulp-ignore');
const sassGlob = require('gulp-sass-glob');
const data = require('gulp-data');
const path = require('path');
const fs = require('fs');

const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

// tasks


// Nunjucks Task
gulp.task('nunjucks', function () {
    // Выводим данные из JSON файла для проверки
    return gulp.src('src/nunjucks/pages/**/*.njk')
        .pipe(data(function () {
            return JSON.parse(fs.readFileSync('src/data/data.json')); // путь к вашему JSON файлу с данными
        }))
        .pipe(nunjucksRender({
            path: ['src']
        }))
        .on('error', function (err) {
            console.error('Error in nunjucks task', err);
        })
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({ stream: true }));
});

// лайв сервер
gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: 'dist'
        },
        notify: false
    });
});


// Сборка и минификация скриптов
gulp.task('scripts', function () {
    return gulp.src('src/assets/scripts/index.js')
        .pipe(webpackStream(webpackConfig, webpack))
        .pipe(gulp.dest('dist/assets/scripts'))
        .pipe(browserSync.reload({ stream: true }));
});

// Компиляция и минификация SCSS
gulp.task('scss', function () {
    return gulp.src('src/scss/style.scss')
        .pipe(sassGlob()) // Добавляем gulp-sass-glob
        .pipe(sass())
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(cache(cssnano()))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/assets/styles'))
        .pipe(browserSync.stream()) // Обновляем CSS на странице при изменении
});


// Чистка папки dist
gulp.task('clean', function () {
    return gulp.src('dist', { allowEmpty: true }).pipe(clean());
});

// Очистка кеша CSS
gulp.task('clear-cache', function (done) {
    return cache.clearAll(done);
});

// Сжатие изображений
gulp.task('img', function () {
    return gulp.src('src/assets/image/**/*.+(jpg|png)')
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        })))
        .pipe(webp())
        .pipe(gulp.dest('src/assets/image'));
});

// SVG спрайт
gulp.task('svgSpriteBuild', function () {
    return gulp.src('src/assets/icons/sprites/**/*.svg')
        // минифицируем svg
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        // удаляем лишние атрибуты
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: { xmlMode: true }
        }))
        // правим баг (иногда он преобразовывает символ ‘>’ в кодировку '&gt;')
        .pipe(replace('&gt;', '>'))
        // делем спрайт
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "../sprite.svg"
                }
            }
        }))
        .pipe(gulp.dest('src/assets/icons'));
});


gulp.task('godist', function () {
    const buildIcons = gulp.src([
        'src/assets/icons/**/*'
    ])
        .pipe(gulp.dest('dist/assets/icons'));

    const buildImage = gulp.src([
        'src/assets/image/**/*'
    ])
        .pipe(gulp.dest('dist/assets/image'));

        return Promise.all([buildIcons, buildImage]);
});




// gulp.watch
gulp.task('watch', function () {
    gulp.watch('src/assets/scripts/**/*.js', gulp.parallel('scripts')); // Следим за JS
    gulp.watch('src/scss/**/*.scss', gulp.parallel('scss')); // Следим за SCSS файлами
    gulp.watch('src/nunjucks/partials/**/*.scss', gulp.parallel('scss')); // Следим за SCSS компонентами
    gulp.watch('src/nunjucks/partials/**/*.js', gulp.parallel('scripts')); // Следим за JS компонентами
    gulp.watch('src/nunjucks/partials/components/**/*.njk', gulp.parallel('nunjucks')); // Следим за Nunjucks
    gulp.watch('src/nunjucks/**/*.njk', gulp.parallel('nunjucks')); // Следим за Nunjucks
    gulp.watch('src/**/*.json').on('change', browserSync.reload); // Следим за json
    gulp.watch('dist/**/*.html').on('change', browserSync.reload); // Следим за HTML
    gulp.watch('src/assets/image/**/*.+(jpg|png|webp)', gulp.parallel('godist')); // Следим за новыми изображениями
    gulp.watch('src/assets/icons/**/*.+(svg|ico)', gulp.parallel('godist')); // Следим за новыми иконками
});


// Задача по умолчанию
gulp.task('default', gulp.series('clean', 'svgSpriteBuild', gulp.parallel('nunjucks', 'img', 'scss', 'scripts', 'browser-sync', 'godist', 'watch')));

// Задача для сборки
gulp.task('build', gulp.series('clean', gulp.parallel('nunjucks', 'scss', 'scripts', 'img', 'svgSpriteBuild', 'godist')));
