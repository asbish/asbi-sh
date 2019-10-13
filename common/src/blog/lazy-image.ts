/**
 * Example
 *
 * <span class="lazy-image"
 *       data-src="path/to/image"
 *       data-src-webp="path/to/image"
 *       data-alt="foo">
 *   <span class="lazy-image-inner" style="max-width:500px">
 *     <span class="lazy-image-container" style="padding-bottom:62.5%"></span>
 *   </span>
 * </span>
 */

import 'intersection-observer';
import supportsWebP from 'supports-webp';

let loadingNode: HTMLSpanElement;

function createLoadingNode(): Node {
  if (!loadingNode) {
    const span = document.createElement('span');
    const rect = document.createElement('span');
    span.className = 'lazy-image-loading';
    rect.className = 'lazy-image-loading-rect';
    for (let i = 0; i < 6; ++i) {
      span.appendChild(rect.cloneNode(false));
    }
    loadingNode = span;
  }

  return loadingNode.cloneNode(true);
}

function handleLoadImage(this: HTMLImageElement, elem: Element): void {
  elem.setAttribute('aria-busy', 'false');
  elem.querySelector('.lazy-image-container')!.appendChild(this);
}

function putImage(elem: Element): void {
  elem.setAttribute('aria-busy', 'true');
  elem.querySelector('.lazy-image-container')!.appendChild(createLoadingNode());

  const img = new Image();
  img.className = 'lazy-image-img';
  img.alt = elem.getAttribute('data-alt') || '';

  supportsWebP.then((supported): void => {
    const webP = elem.getAttribute('data-src-webp');
    if (supported && webP) {
      img.src = webP;
      img.onload = handleLoadImage.bind(img, elem);
      return;
    }

    const src = elem.getAttribute('data-src');
    if (src) {
      img.src = src;
      img.onload = handleLoadImage.bind(img, elem);
    } else {
      elem.setAttribute('aria-busy', 'false');
    }
  });
}

// Setup Observer

function handleIntersection(
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver
): void {
  for (let i = 0; i < entries.length; ++i) {
    if (entries[i].intersectionRatio > 0) {
      const elem = entries[i].target;
      putImage(elem);
      observer.unobserve(elem);
    }
  }
}

export function init(): void {
  const elems = document.getElementsByClassName('lazy-image');
  if (!elems.length && elems.length === 0) return;

  const observer = new IntersectionObserver(handleIntersection);

  const _elems = Array.prototype.slice.call(elems);
  for (let i = 0; i < _elems.length; ++i) {
    observer.observe(_elems[i]);
  }
}
