import 'es6-promise/auto';

import * as layout from './layout';
import { register } from './service-worker-registration';

document.addEventListener(
  'DOMContentLoaded',
  () => {
    layout.init();
  },
  false
);

let onceSupported = false;
try {
  const options = Object.defineProperty({}, 'once', {
    // eslint-disable-next-line getter-return
    get: function () {
      onceSupported = true;
    }
  });

  window.addEventListener('test', options, options);
  window.removeEventListener('test', options, options);
} catch (err) {
  onceSupported = false;
}

if ('serviceWorker' in navigator && onceSupported) {
  window.addEventListener('load', () => {
    // FUTURE: Prepare a way to send `skipWaiting` message
    register('/sw.js');
  });
}
