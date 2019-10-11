/**
 * Need:  `className`, `data-src` and `data-height-ratio`
 * Optional: `data-src-webp`, `data-alt`, `data-max-width` and `data-pos`
 *
 * <span class="lazy-image"
 *       data-src="path-to-image"
 *       data-height-ratio="62.5%(height/width)"
 *       data-src-webp="path/to/image"
 *       data-alt="foo bar"
 *       data-max-width="500px"
 *       data-pos="center | left | right">
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

function appendChildElements(elem: Element): void {
  const pos = elem.getAttribute('data-pos');
  elem.setAttribute(
    'style',
    `text-align: ${
      pos === 'center' ? 'center' : pos === 'right' ? 'right' : 'left'
    }`
  );

  const inner = document.createElement('span');
  inner.className = 'lazy-image-inner';
  inner.setAttribute(
    'style',
    `max-width: ${elem.getAttribute('data-max-width') || '100%'}`
  );

  const imageContainer = document.createElement('span');
  imageContainer.className = 'lazy-image-container';
  imageContainer.setAttribute(
    'style',
    `padding-bottom: ${elem.getAttribute('data-height-ratio') || '100%'}`
  );
  imageContainer.appendChild(createLoadingNode());

  inner.appendChild(imageContainer);
  elem.appendChild(inner);
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
    const elem = _elems[i];
    appendChildElements(elem);
    observer.observe(elem);
  }
}
