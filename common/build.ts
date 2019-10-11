import path from 'path';
import * as utils from 'shared/build/utils';
import { version } from './package.json';

async function image404() {
  const encode = await utils.base64('src/404/404.png');
  await utils.writeFile(
    `data:image/png;base64,${encode}`,
    'dist',
    '404.base64'
  );
}

async function main(): Promise<void> {
  const hashOption = {
    hash: process.env.NODE_ENV === 'development' ? false : 24
  };

  await Promise.all([
    utils.buildPostCSS(
      'src/global/index.css',
      'dist',
      'global.css',
      hashOption
    ),
    utils.buildRollup('src/global/index.ts', 'dist', 'global.js', hashOption),

    utils.buildRollup('src/sw/index.ts', 'dist', 'sw.js', {
      format: 'cjs',
      license: false,
      replace: { VERSION: JSON.stringify(version) },
      tsconfigPath: path.resolve(__dirname, './src/sw/tsconfig.json')
    }),

    utils.buildPostCSS('src/blog/index.css', 'dist', 'blog.css', hashOption),
    utils.buildRollup('src/blog/index.ts', 'dist', 'blog.js', hashOption),

    image404(),
    utils.buildPostCSS('src/404/index.css', 'dist', '404.css')
  ]).catch(err => {
    console.error(err); // eslint-disable-line no-console
    process.exit(1);
  });
}

main();
