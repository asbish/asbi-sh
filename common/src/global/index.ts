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

// TODO: Move to shared
let onceSupported = false;
try {
  const options = Object.defineProperty({}, 'once', {
    // eslint-disable-next-line getter-return
    get: function () {
      onceSupported = true;
    }
  });

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-ignore
  window.addEventListener('test', options, options);
  // @ts-ignore
  window.removeEventListener('test', options, options);
  /* eslint-enable @typescript-eslint/ban-ts-comment */
} catch (err) {
  onceSupported = false;
}

if ('serviceWorker' in navigator && onceSupported) {
  window.addEventListener('load', () => {
    // FUTURE: Prepare a way to send `skipWaiting` message
    register('/sw.js');
  });
}
