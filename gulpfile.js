const gulp = require('gulp');
const gutil = require('gulp-util');
const { spawn } = require('child_process');
const runSequence = require('run-sequence');
const BrowserSync = require('browser-sync');
const postcss = require('gulp-postcss');
const cssnext = require('postcss-cssnext');
const cssnano = require('cssnano');
const { rollup } = require('rollup');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const uglify = require('rollup-plugin-uglify');
const { minify } = require('uglify-es');

const browserSync = BrowserSync.create();
const browserSyncConfig = {
  server: {
    baseDir: './_site',
  },
};

function preserveLicense(node, comment) {
  const text = comment.value;
  if (comment.type === 'comment2') {
    return /3rd party license information/i.test(text);
  }
  return null;
}

let production = false;
let rebuild = false;

gulp.task('css', () => {
  let plugins = [cssnext()];
  if (production) plugins = [...plugins, cssnano({ preset: 'default' })];

  return gulp.src('./src/css/**/*.css')
    .pipe(postcss(plugins))
    .on('error', (err) => {
      browserSync.notify('css build failed');
      gutil.log(gutil.colors.red(err.message));
      if (production) process.exit(1);
    })
    .pipe(gulp.dest('./static/css'));
});

gulp.task('js', async () => {
  let plugins = [
    commonjs(),
    resolve({ jsnext: true }),
    babel({ exclude: 'node_modules/**' }),
  ];
  if (production) {
    plugins = [
      ...plugins,
      uglify({ output: { comments: preserveLicense } }, minify),
    ];
  }
  const bundle = await rollup({
    input: './src/js/main.js',
    plugins,
  }).catch((err) => {
    browserSync.notify('js build failed');
    gutil.log(gutil.colors.red(err.message));
  });
  return bundle.write({
    file: './static/js/main.js',
    format: 'iife',
  });
});

gulp.task('hakyll', (cb) => {
  const hakyll = spawn('stack', ['build']);
  let stderr = '';
  hakyll.stderr.on('data', (data) => {
    stderr += data.toString('utf8');
  });
  return hakyll.on('close', (statusCode) => {
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
  site.stdout.on('data', (data) => {
    stderr += data.toString('utf8');
  });
  return site.on('close', (statusCode) => {
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
