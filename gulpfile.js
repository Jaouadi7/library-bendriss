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

//---------------------------------------------
//   SETUP DEVELOPMENT TASK  ( WATCH TASK)  ---
//---------------------------------------------

const dev = ( done ) => {
    watch( `${development}html/pages/**/*.html`, series( build_html, reload) );
    done();
}

//------------------------------------
//            DEFINE TASKS         ---
//------------------------------------

task( 'watch', parallel(start_server, dev) );
task( 'html', build_html );




