import * as utils from 'shared/build/utils';

async function main(): Promise<void> {
  try {
    await utils.buildPostCSS('home.css', 'dist/inline', 'home.css');
    await utils.copyFile('index.html', 'dist', 'index.html');
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    process.exit(1);
  }
}

main();
