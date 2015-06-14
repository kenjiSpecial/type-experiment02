const argv = require('minimist')(process.argv.slice(2))
const openURL = require('opn');
const once = require('once');

const gulp = require('gulp');
const watchify = require('watchify');
const duration = require('gulp-duration');
const ghPages = require('gulp-gh-pages');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const streamify = require('gulp-streamify');
const source = require('vinyl-source-stream');

//var gulpDeploy https://www.npmjs.com/package/gulp-gh-pages
const budo = require('budo');
const browserify = require('browserify');
const resetCSS = require('node-reset-scss').includePath;
const garnish = require('garnish');
const babelify = require('babelify');
const reactify = require('reactify');
const autoprefixer = require('gulp-autoprefixer');
const errorify = require('errorify');
const sourcemaps = require('gulp-sourcemaps');

const entry = './src/js/index.js';
const outfile = 'bundle.js';




//our CSS pre-processor
gulp.task('sass', function () {
    gulp.src('./src/sass/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: argv.production ? 'compressed' : undefined,
            includePaths: [resetCSS]
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('../public'))
});


gulp.task('watchify', compile);

function compile(){
    var bundler = watchify(browserify({
        entries : ['./src/js/index.js'],
        transform: [reactify, babelify], // We want to convert JSX to normal javascript
        debug: true, // Gives us sourcemapping
        plugin : errorify,
        cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
    }));


    bundler
        .on('update', function(){

            var updateStart = Date.now();
            console.log('Updating!');
            bundler.bundle() // Create new bundle that uses the cache for high performance
                .pipe(source(outfile))
                .pipe(gulp.dest('../public'));

            console.log('Updated!', (Date.now() - updateStart) + 'ms');
            console.log("");
        })
        .bundle() // Create the initial bundle when starting the task
        .pipe(source(outfile))
        .pipe(gulp.dest('../public'));
}

//the development task
gulp.task('watch', ['sass', 'watchify'], function (cb) {
    //watch SASS
    gulp.watch(['src/sass/*.scss', 'src/sass/**/*.scss'] , ['sass']);

    var ready = function () {
    };
    var pretty = garnish();
    pretty.pipe(process.stdout);

});

//the distribution bundle task
gulp.task('bundle', ['sass'], function () {
    var bundler = browserify(entry, {transform: [babelify, reactify]})
        .bundle();

    return bundler
        .pipe(source('index.js'))
        .pipe(streamify(uglify()))
        .pipe(rename(outfile))
        .pipe(gulp.dest('../public'))
});

gulp.task('deploy', function() {
    return gulp.src('../public/*')
        .pipe(ghPages());
});
