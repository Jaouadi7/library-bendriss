//---------------------------------------
//     SETUP THE PROJECT ROUTES       ---
//---------------------------------------

const development = './src/';
const production =  './dist/';
const node_modules = './node_modules/';

//---------------------------------------
//        INSTALLED NPM PLUGINS       ---
//---------------------------------------

import gulp from 'gulp';
import browserSync from 'browser-sync';
import panini from 'panini';
import gulpSass from 'gulp-sass';
import defaultSass from 'sass';
import autoPrefixer from 'gulp-autoprefixer';
import sourceMaps from 'gulp-sourcemaps';
import images from 'gulp-image';


//---------------------------------------
//    SETUP PLUGINS FOR THE PROJECT   ---
//---------------------------------------

const { src, dest, task, parallel, series, watch } = gulp;

const start_server = ( done ) => {
    browserSync.init({
        server: {
            baseDir: `${production}`
        }
    })
}

const reload = ( done ) => {
    browserSync.reload;
    done();
}

const sass = gulpSass(defaultSass);

//---------------------------------------
//         SETUP HTML TASK            ---
//---------------------------------------

const build_html = ( done ) => {
    panini.refresh();
    src(`${development}html/pages/*.html`)
    .pipe(panini({
        root:`${development}html/pages/`,
        layouts: `${development}html/layouts/`,
        partials: `${development}html/partials/`,
    }))
    .pipe( dest(`${production}`) )
    .pipe(browserSync.reload({stream: true}));
    done();
}

//---------------------------------------
//         SETUP SCSS TASK            ---
//---------------------------------------

const build_css = ( done ) => {
    src(`${development}scss/**/*.scss`)
    .pipe( sourceMaps.init() )
    .pipe(
        sass().on('error', sass.logError)
    )
    .pipe(
        autoPrefixer({
        cascade: false,
        })
    )
    .pipe( sourceMaps.write('.') )
    .pipe( dest(`${production}css/`) )
    .pipe(browserSync.reload({stream: true}));
    done();
}

//---------------------------------------
//         SETUP JS TASK            ---
//---------------------------------------

const build_js = ( done ) => {
    src(`${development}js/**/*.js`)
    .pipe( dest(`${production}js/`) )
    .pipe(browserSync.reload({stream: true}));
    done();
}

//---------------------------------------
//          SETUP IMG TASK            ---
//---------------------------------------

const compressImages = (  done  ) => {
    src(`${development}/images/*`)
    .pipe(images())
    .pipe(dest(`${production}/img/`));
    done();
}

//---------------------------------------------
//   SETUP DEVELOPMENT TASK  ( WATCH TASK)  ---
//---------------------------------------------

const dev = ( done ) => {
    watch( `${development}html/pages/**/*.html`, series( build_html, reload) );
    watch( `${development}scss/**/*.scss`, series( build_css, reload) );
    watch( `${development}js/**/*.js`, series( build_js, reload) );
    watch( `${development}images/*`, series( compressImages, reload) );
    done();
}

//------------------------------------
//            DEFINE TASKS         ---
//------------------------------------

task( 'watch', parallel(start_server, compressImages, dev) );
task( 'html', build_html );
task( 'css', build_css );
task( 'js', build_js );
task( 'images', compressImages );





