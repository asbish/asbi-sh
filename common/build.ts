/* eslint-disable @typescript-eslint/no-var-requires */

import path from 'path';
import { promises as fs } from 'fs';
import crypto from 'crypto';
import postcss from 'postcss';
import * as rollup from 'rollup';
import rollupTsPlugin from 'rollup-plugin-typescript2';
import { version } from './package.json';

async function mkdir(outDir: string): Promise<void> {
  return fs
    .mkdir(path.resolve(process.cwd(), outDir), { recursive: true })
    .catch((err): void | never => {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    });
}

interface BuildCSSOptions {
  hash: boolean;
}

async function buildCSS(
  inputFile: string,
  outDir: string,
  outFileName: string,
  options: BuildCSSOptions = { hash: false }
): Promise<void> {
  const fromPath = path.resolve(process.cwd(), inputFile);

  const content = await fs.readFile(fromPath, 'utf-8');
  if (!content) {
    throw new Error(`${inputFile} is empty.`);
  }

  await mkdir(outDir);

  const data = await postcss([
    require('postcss-import')(),
    require('postcss-preset-env')(
      require('shared/build/postcss-preset-env.config.js')
    ),
    require('cssnano')({ preset: 'default' })
  ]).process(content, { from: fromPath });

  if (data && 'css' in data) {
    if (options.hash) {
      const hasher = crypto.createHash('sha1');
      hasher.update(data.css);
      const hash = hasher.digest('hex');
      return fs.writeFile(
        path.resolve(process.cwd(), outDir, `${outFileName}-${hash}.css`),
        data.css
      );
    }

    return fs.writeFile(
      path.resolve(process.cwd(), outDir, `${outFileName}.css`),
      data.css
    );
  }
}

interface BuildTSOptions {
  hash?: boolean;
  format?: rollup.ModuleFormat;
  license?: boolean;
  replace?: Object; // eslint-disable-line @typescript-eslint/ban-types
  tsconfigPath?: string;
}

async function buildTS(
  input: string,
  outDir: string,
  outFileName: string,
  _options: BuildTSOptions = {}
): Promise<rollup.RollupOutput> {
  const options: BuildTSOptions = {
    hash: false,
    format: 'iife',
    license: true,
    tsconfigPath: path.resolve(process.cwd(), 'tsconfig.json'),
    ..._options
  };

  const plugins = [
    require('rollup-plugin-node-resolve')({ browser: true }),
    require('rollup-plugin-commonjs')()
  ];

  if (options.replace) {
    plugins.push(require('rollup-plugin-replace')(options.replace));
  }

  plugins.push(
    rollupTsPlugin({
      tsconfig: options.tsconfigPath,
      verbosity: 1
    })
  );

  plugins.push(
    require('rollup-plugin-terser').terser({
      compress: {
        inline: 1
      },
      mangle: {
        safari10: true
      },
      output: {
        safari10: true
      }
    })
  );

  if (options.license) {
    plugins.push(
      require('rollup-plugin-license')({
        banner: `3rd party licenses are at ${outFileName}.js.license`,
        thirdParty: {
          includePrivate: false,
          output: {
            file: path.join(process.cwd(), outDir, `${outFileName}.js.license`),
            encoding: 'utf-8'
          }
        }
      })
    );
  }

  const bundle = await rollup.rollup({
    input: path.resolve(process.cwd(), input),
    plugins
  });

  await mkdir(outDir);

  return bundle.write({
    dir: path.join(process.cwd(), outDir),
    entryFileNames: options.hash
      ? `${outFileName}-[hash].js`
      : `${outFileName}.js`,
    format: options.format
  });
}

// Main

async function image404() {
  const data = await fs.readFile(
    path.resolve(process.cwd(), 'src/404/404.png'),
    'binary'
  );
  if (!data) {
    throw new Error(`404.png is null.`);
  }

  const encode = Buffer.from(data, 'binary').toString('base64');
  await mkdir('dist');
  return fs.writeFile(
    path.resolve(process.cwd(), 'dist', '404.base64'),
    `data:image/png;base64,${encode}`
  );
}

async function all(): Promise<void> {
  await Promise.all([
    buildCSS('src/global/index.css', 'dist', 'global', { hash: true }),
    buildTS('src/global/index.ts', 'dist', 'global', { hash: true }),

    buildTS('src/sw/index.ts', 'dist', 'sw', {
      format: 'cjs',
      license: false, // No third parties dependencies
      replace: { VERSION: JSON.stringify(version) },
      tsconfigPath: path.resolve(__dirname, './src/sw/tsconfig.json')
    }),

    buildCSS('src/blog/index.css', 'dist', 'blog', { hash: true }),
    buildTS('src/blog/index.ts', 'dist', 'blog', { hash: true }),

    buildCSS('src/404/index.css', 'dist', '404'),
    image404()
  ]).catch(err => {
    console.error(err); // eslint-disable-line no-console
    process.exit(1);
  });
}

all();
