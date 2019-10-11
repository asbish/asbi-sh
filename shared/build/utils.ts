/* eslint-disable @typescript-eslint/no-var-requires */

import path from 'path';
import { promises as fs } from 'fs';
import hasher from 'node-object-hash';
import postcss from 'postcss';
import * as rollup from 'rollup';
import rollupTsPlugin from 'rollup-plugin-typescript2';

//
// File
//

export async function mkdir(outDir: string): Promise<void> {
  return fs
    .mkdir(path.resolve(process.cwd(), outDir), { recursive: true })
    .catch((err): void | never => {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    });
}

export async function copyFile(
  inputFile: string,
  outDir: string,
  outFile: string
): Promise<void> {
  await mkdir(path.resolve(process.cwd(), outDir));
  return fs.copyFile(
    path.resolve(process.cwd(), inputFile),
    path.resolve(process.cwd(), outDir, outFile)
  );
}

export async function writeFile(
  content: string,
  outDir: string,
  outFile: string
): Promise<void> {
  await mkdir(path.resolve(process.cwd(), outDir));
  return fs.writeFile(path.resolve(process.cwd(), outDir, outFile), content);
}

export async function base64(input: string): Promise<string> {
  const data = await fs.readFile(path.resolve(process.cwd(), input), 'binary');
  if (!data) {
    throw new Error(`${input} is null.`);
  }

  return Buffer.from(data, 'binary').toString('base64');
}

//
// Bundle builders for css and js
//

let _cachedDateHash: string | null = null;

function dateHash() {
  if (_cachedDateHash) return _cachedDateHash;

  _cachedDateHash = hasher({ sort: false, alg: 'md5' }).hash(new Date());
  return _cachedDateHash;
}

function reviseOutFile<T extends { hash?: number | boolean }>(
  outFile: string,
  extension: string,
  options: T
) {
  if (options.hash) {
    let hash = dateHash();

    if (typeof options.hash === 'number') {
      hash = hash.substring(0, options.hash);
    }

    const reg = new RegExp(`\\.${extension}$`);
    const revised = outFile.replace(reg, `-${hash}.${extension}`);

    // When outFile doesn't have an extension
    if (revised === outFile) return `${outFile}-${hash}`;

    return revised;
  }

  return outFile;
}

interface BuildPostCSSOptions {
  hash?: number | boolean;
}

export async function buildPostCSS(
  inputFile: string,
  outDir: string,
  outFile: string,
  _options: BuildPostCSSOptions = {}
): Promise<void> {
  const options: BuildPostCSSOptions = { hash: false, ..._options };

  const fromPath = path.resolve(process.cwd(), inputFile);

  const data = await fs.readFile(fromPath, 'utf-8');
  if (!data) {
    throw new Error(`${inputFile} is empty.`);
  }

  await mkdir(outDir);

  const toPath = path.resolve(
    process.cwd(),
    outDir,
    reviseOutFile(outFile, 'css', options)
  );

  const result = await postcss([
    require('postcss-import')(),
    require('postcss-preset-env')(require('./postcss-preset-env.config.js')),
    require('cssnano')({ preset: 'default' })
  ]).process(data, { from: fromPath, to: toPath });

  if (result && 'css' in result) {
    return fs.writeFile(toPath, result.css);
  }
}

interface BuildRollupOptions {
  hash?: number | boolean;
  format?: rollup.ModuleFormat;
  license?: boolean;
  replace?: Object; // eslint-disable-line @typescript-eslint/ban-types
  tsconfigPath?: string;
}

export async function buildRollup(
  input: string,
  outDir: string,
  outFile: string,
  _options: BuildRollupOptions = {}
): Promise<rollup.RollupOutput> {
  const options: BuildRollupOptions = {
    hash: false,
    format: 'iife',
    license: true,
    tsconfigPath: path.resolve(process.cwd(), 'tsconfig.json'),
    ..._options
  };

  const revisedOutFile = reviseOutFile(outFile, 'js', options);

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
        banner: `3rd party licenses are at ${revisedOutFile}.license`,
        thirdParty: {
          includePrivate: false,
          output: {
            file: path.join(process.cwd(), outDir, `${revisedOutFile}.license`),
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

  return bundle.write({
    file: path.join(process.cwd(), outDir, revisedOutFile),
    format: options.format
  });
}
