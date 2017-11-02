import './3rdPartyLicense.js';
import {
  toggleAttr,
  toggleStyle,
  toggleTabIndexes,
} from './toggle.js';
import {subscribeResize} from './viewport.js';
import lazyImages from './lazyImages.js';

let width = window.innerWidth;

document.getElementById('ico-menu')
  .addEventListener('mousedown', toggleMenu, false);

document.getElementById('ico-menu').addEventListener('keydown', (e) => {
  if (e.code !== 'Enter') return;
  toggleMenu();
}, false);

document.getElementById('mask')
  .addEventListener('mousedown', toggleMenu, false);

subscribeResize(resize);

lazyImages();

function toggleMenu() {
  const body = document.getElementsByTagName('body')[0];
  const main = document.getElementsByTagName('main')[0];
  const title = document.getElementById('title');
  toggleAttr(body, 'data-menu', 'closed', 'opened');
  toggleAttr(main, 'aria-hidden', 'false', 'true');
  toggleAttr(title, 'aria-hidden', 'false', 'true');
  setTimeout(toggleTabIndexes(main), 0);
  toggleTabIndexes(title);

  const icoMenu = document.getElementById('ico-menu');
  toggleAttr(icoMenu, 'aria-label', 'menu', 'close menu');

  const lines = icoMenu.querySelector('g').childNodes;
  const cache = lines[0].getAttribute('y2');
  lines[0].setAttribute('y2', lines[2].getAttribute('y2'));
  lines[2].setAttribute('y2', cache);
  toggleStyle(lines[1], 'visibility', 'visible', 'hidden');
}

function resize() {
  if (!this || window.innerWidth !== width) {
    width = window.innerWidth;
    const menu = document.getElementById('menu');
    const body = document.getElementsByTagName('body')[0];
    if (window.innerWidth < 769) {
      menu.style['transition-duration'] = '150ms';
    } else {
      menu.style['transition-duration'] = '0s';
      if (body.getAttribute('data-menu') === 'opened') toggleMenu();
    }
  }
}
