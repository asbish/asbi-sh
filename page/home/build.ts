/* eslint-disable @typescript-eslint/no-var-requires */

import path from 'path';
import { promises as fs } from 'fs';
import postcss from 'postcss';

async function mkdir(outDir: string): Promise<void> {
  return fs
    .mkdir(path.resolve(process.cwd(), outDir), { recursive: true })
    .catch((err): void | never => {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    });
}
async function all(): Promise<void> {
  try {
    await mkdir('dist/inline');

    // index.html
    await fs.copyFile(
      path.resolve(process.cwd(), 'src', 'index.html'),
      path.resolve(process.cwd(), 'dist', 'index.html')
    );

    // home.css
    const cssIn = path.resolve(process.cwd(), 'src', 'home.css');
    const cssOut = path.resolve(process.cwd(), 'dist/inline', 'home.css');

    const cssContent = await fs.readFile(cssIn, 'utf-8');
    if (!cssContent) {
      throw new Error('home.css is empty.');
    }

    const cssCompiled = await postcss([
      require('postcss-import')(),
      require('postcss-preset-env')(
        require('shared/build/postcss-preset-env.config.js')
      ),
      require('cssnano')({ preset: 'default' })
    ]).process(cssContent, { from: cssIn, to: cssOut });

    if (cssCompiled && 'css' in cssCompiled) {
      return fs.writeFile(cssOut, cssCompiled.css);
    }
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    process.exit(1);
  }
}

all();
