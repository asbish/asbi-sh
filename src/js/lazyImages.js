/**
 * Usage:
 * Add `lazy-image` className,`data-src` attribute and `padding-bottom`.
 * `data-alt` and `data-src-webp` are optional.
 *
 * <div class="lazy-image"
 *      data-src="path-to-image"
 *      data-src-webp="path-to-image"
 *      data-alt="alternate-text"
 *      style="padding-bottom:62.5%">
 * </ div>
 *
 */

import supportsWebP from 'supports-webp';
import {observe} from './viewport.js';

let loadingDOM;

function createLoadingDOM() {
  const div = document.createElement('div');
  const rect = document.createElement('div');
  div.className = 'lazy-image_loading';
  rect.className = 'lazy-image_loading_rect';
  for (let i = 0; i < 6; ++i) { div.appendChild(rect.cloneNode(false)); }
  loadingDOM = div;
}

function onload(elem) {
  elem.setAttribute('data-src-state', 'loaded');
  elem.appendChild(this);
}

function lazyImage(elem) {
  if (!loadingDOM) createLoadingDOM();
  elem.setAttribute('data-src-state', 'loading');
  elem.appendChild(loadingDOM.cloneNode(true));

  const img = new Image();
  const alt = elem.getAttribute('data-alt');
  img.alt = alt ? alt : '';
  const srcWebP = elem.getAttribute('data-src-webp');
  if (supportsWebP && srcWebP) {
    img.src = srcWebP;
  } else {
    img.src = elem.getAttribute('data-src');
  }
  img.onload = onload.bind(img, elem);
}

function callLazyImage(entry, observer) {
  for (let i = 0; i < entry.length; ++i) {
    const elem = entry[i].target;
    lazyImage(elem);
    observer.unobserve(elem);
  }
}

function lazyImages() {
  const elems = document.getElementsByClassName('lazy-image');
  if (!elems.length && elems.length === 0) return;
  observe(Array.prototype.slice.call(elems), callLazyImage);
}

export default lazyImages;
