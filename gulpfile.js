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
import merge from 'merge-stream';
import fs from 'fs';
import clean from 'gulp-clean';
import htmlmin from 'gulp-htmlmin';
import cleanCSS from 'clean-css';
import minify from 'gulp-minify';

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

//---------------------------------------
//          SETUP FONTS TASK          ---
//---------------------------------------

const fonts = ( done  ) => {
    src(`${development}fonts/**/*.['ttf', 'otf', 'css']`)
    .pipe(dest(`${production}fonts/fonts/`))
    .pipe(browserSync.reload({stream: true}));
    done();
}

//---------------------------------------
//             ASSETS TASK            ---
//---------------------------------------

const assets = (  ) => {
  // BULMA
  const bulma = src(`${node_modules}bulma/*.sass`)
    .pipe(
      sass().on('Error', sass.logError)
    )
    .pipe(dest(`${production}css/assets/`));

  // FONTAWESOME
  const fontawesome_css = src(
    `${node_modules}@fortawesome/fontawesome-free/css/all.css`
  ).pipe(dest(`${production}fonts/fontawesome/css`));

  //WEBFONTS DIR
  const webfonts = src(
    `${node_modules}@fortawesome/fontawesome-free/webfonts/*`
  ).pipe(dest(`${production}fonts/fontawesome/webfonts`));

  //HTML5SHIV.JS
  const HTML5shiv = src(`${node_modules}html5shiv/dist/html5shiv.min.js`).pipe(
    dest(`${production}js/assets`)
  );
  //RESPOND.JS
  const respond = src(`${node_modules}respond.js/dest/respond.min.js`).pipe(
    dest(`${production}js/assets`)
  );

  return merge(bulma, fontawesome_css, webfonts, HTML5shiv, respond);

}

//-------------------------------------------------
//   BUILD MODE FOR PREVIEWS  [ MINIFY FILES]   ---
//-------------------------------------------------

const compressFiles = (done) => {
    if (fs.existsSync('./client')) {
      src('./client').pipe(clean({ force: true }));
    }
    // MINIFY HTML
    src(`${development}html/pages/**/*.html`)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('build/'));
    // MINIFY CSS
    src(`${development}scss/**/*.scss`)
    .pipe(
      sass({
        outputStyle: 'compressed',
      }).on('error', sass.logError)
    )
    .pipe(
      autoPrefixer({
        cascade: false,
      })
    )
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(dest('build/css/'));
    // BULMA
    src(`${node_modules}bulma/*.sass`)
    .pipe(
      sass({
        outputStyle: 'compressed',
      }).on('Error', sass.logError)
    )
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(dest(`build/css/assets/`));
    // FONT AWESOME
    src(`${node_modules}@fortawesome/fontawesome-free/css/all.css`)
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(dest(`build/fonts/fontawesome/css`));
    // MINIFY JS
    src(`${development}scripts/*.js`)
    .pipe(
      minify({
        ext: {
          min: '.js',
        },
        noSource: true,
      })
    )
    .pipe(dest('build/js/'));
    // COMPRESS IMAGES
    src(`${development}images/*`).pipe(images()).pipe(dest(`build/img/`));  
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
    watch( `${development}fonts/**/*.['ttf', 'otf', 'css']`, series( fonts, reload) );
    done();
}

//------------------------------------
//            DEFINE TASKS         ---
//------------------------------------

task( 'watch', parallel(start_server, assets, compressImages, dev) );
task( 'html', build_html );
task( 'css', build_css );
task( 'js', build_js );
task( 'images', compressImages );
task( 'fonts', fonts );
task( 'assets', assets );
task( 'build', compressFiles );

