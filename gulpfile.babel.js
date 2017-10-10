'use strict';

import gulp from 'gulp';
import gutil from 'gulp-util';
import {spawn} from 'child_process';
import runSequence from 'run-sequence';
import BrowserSync from 'browser-sync';
import postcss from 'gulp-postcss';
import cssnext from 'postcss-cssnext';
import cssnano from 'cssnano';
import {rollup} from 'rollup';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import {minify} from 'uglify-es';
import 'babel-polyfill';

process.env.BABEL_ENV = 'umd';

const browserSync = BrowserSync.create();
const browserSyncConfig = {
  server: {
    baseDir: './_site',
  },
};

let production = false;
let rebuild = false;

gulp.task('css', () => {
  let plugins = [cssnext()];
  if (production) plugins = [...plugins, cssnano({preset: 'default'})];
  return gulp.src('./src/css/**/*.css')
    .pipe(postcss(plugins))
    .on('error', (err) => {
      browserSync.notify('css build failed');
      gutil.log(gutil.colors.red(err.message));
      if (production) process.exit(1);
    })
    .pipe(gulp.dest('./static/css'));
});

gulp.task('js', async function() {
  let plugins = [
    commonjs(),
    resolve(),
    babel({exclude: 'node_modules/**'}),
  ];
  if (production) plugins = [...plugins, uglify({}, minify)];
  const bundle = await rollup({
    input: './src/js/main.js',
    plugins: plugins,
  }).catch((err) => {
    browserSync.notify('js build failed');
    gutil.log(gutil.colors.red(err.message));
  });
  return bundle.write({
    file: './static/js/main.js',
    format: 'umd',
  });
});

gulp.task('hakyll', (cb) => {
  const hakyll = spawn('stack', ['build']);
  let stderr = '';
  hakyll.stderr.on('data', data => {
    stderr += data.toString('utf8');
  });
  return hakyll.on('close', statusCode => {
    if (statusCode === 0) {
      rebuild = true;
      cb();
    } else {
      browserSync.notify('hakyll build failed');
      gutil.log(gutil.colors.red(stderr));
      if (production) process.exit(1);
      cb();
    }
  });
});

gulp.task('site', (cb) => {
  const site = rebuild
        ? spawn('stack', ['exec', 'site', 'rebuild'])
        : spawn('stack', ['exec', 'site', 'build']);
  rebuild = false;
  let stderr = '';
  site.stdout.on('data', data => {
    stderr += data.toString('utf8');
  });
  return site.on('close', statusCode => {
    if (statusCode === 0) {
      browserSync.reload();
      cb();
    } else {
      browserSync.notify('site build failed');
      gutil.log(gutil.colors.red(stderr));
      if (production) process.exit(1);
      cb();
    }
  });
});

gulp.task('stack-rebuild', () => {
  runSequence('hakyll', 'site');
});

gulp.task('server', () => {
  production = false;
  browserSync.init(browserSyncConfig);
  gulp.watch([
    'templates/**/*',
    'static/**/*',
    'content/index.html',
    'content/*/dist/**/*',
  ], ['site']);
  gulp.watch(['src/css/**/*'], ['css']);
  gulp.watch(['src/js/**/*'], ['js']);
  gulp.watch(['site.hs', 'asbi-sh.cabal'], ['stack-rebuild']);
});

gulp.task('build', () => {
  production = true;
  runSequence('css', 'js', 'hakyll', 'site');
});

gulp.task('build-assets', () => {
  production = true;
  runSequence('css', 'js');
});

gulp.task('default', () => {
  runSequence('css', 'js', 'hakyll', 'site', 'server');
});
