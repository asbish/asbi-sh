import 'es6-promise/auto';
import supportsOnce from 'shared/lib/supports-once';

import * as layout from './layout';
import { register } from './service-worker-registration';

document.addEventListener(
  'DOMContentLoaded',
  () => {
    layout.init();
  },
  false
);

if ('serviceWorker' in navigator && supportsOnce) {
  window.addEventListener('load', () => {
    // FUTURE: Prepare a way to send `skipWaiting` message
    register('/sw.js');
  });
}
