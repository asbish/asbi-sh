'use strict';

import {
  toggleAttr,
  toggleStyle,
  toggleTabIndexes,
} from './toggle.js';

let timeout;
let width = window.innerWidth;
let height = window.innerHeight;

document.getElementById('ico-menu')
  .addEventListener('mousedown', toggleMenu, false);

document.getElementById('ico-menu').addEventListener('keydown', (e) => {
  if (e.code !== 'Enter') return;
  toggleMenu();
}, false);

document.getElementById('menu')
  .addEventListener('transitionend', function(e) {
    const body = document.getElementsByTagName('body')[0];
    if (e.target === this && e.propertyName === 'transform') {
      toggleAttr(body, 'data-menu-transitionend', 'closed', 'opened');
    }
  }, false);

document.getElementById('mask')
  .addEventListener('mousedown', toggleMenu, false);

window.addEventListener('resize', () => {
  clearTimeout(timeout);
  timeout = setTimeout(init, 200);
}, false);

init();

function toggleMenu() {
  const body = document.getElementsByTagName('body')[0];
  const menu = document.getElementById('menu');
  const main = document.getElementsByTagName('main')[0];
  const title = document.getElementById('title');
  toggleAttr(body, 'data-menu', 'closed', 'opened');
  toggleAttr(menu, 'aria-hidden', 'false', 'true');
  toggleAttr(main, 'aria-hidden', 'false', 'true');
  toggleAttr(title, 'aria-hidden', 'false', 'true');
  setTimeout(toggleTabIndexes(main), 0);
  toggleTabIndexes(title);

  const icoMenu = document.getElementById('ico-menu');
  toggleAttr(icoMenu, 'aria-label', 'menu', 'close menu');

  const lines = icoMenu.querySelector('g').children;
  const cache = lines[0].getAttribute('y2');
  lines[0].setAttribute('y2', lines[2].getAttribute('y2'));
  lines[2].setAttribute('y2', cache);
  toggleStyle(lines[1], 'visibility', 'visible', 'hidden');
}

function init() {
  const menu = document.getElementById('menu');

  if (!this || window.innerWidth !== width) {
    width = window.innerWidth;
    const body = document.getElementsByTagName('body')[0];
    const icoMenu = document.getElementById('ico-menu');
    if (window.innerWidth < 769) {
      menu.style['transition-duration'] = '150ms';
      menu.setAttribute('aria-hidden', 'true');
      icoMenu.setAttribute('aria-hidden', 'false');
    } else {
      menu.style['transition-duration'] = '0s';
      menu.setAttribute('aria-hidden', 'false');
      icoMenu.setAttribute('aria-hidden', 'true');
      if (body.getAttribute('data-menu') === 'opened') toggleMenu();
    }
  }

  if (!this || window.innerHeight !== height) {
    height = window.innerHeight;
    menu.style['min-height'] = height.toString() + 'px';
  }
}
