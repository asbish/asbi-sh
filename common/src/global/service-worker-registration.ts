function onControllerChange() {
  // If this site is opened in another tab, it will reload like as current tab.
  // TODO: Show notification before reload.
  location.reload();
}

async function getNewServiceWorker(reg: ServiceWorkerRegistration) {
  if (reg.installing) return reg.installing;

  return new Promise<ServiceWorker | null>((resolve) => {
    let timeoutID: number | null = null;

    const onUpdateFound = () => {
      if (typeof timeoutID === 'number') {
        window.clearTimeout(timeoutID);
      }
      resolve(reg.installing);
    };

    reg.addEventListener('updatefound', onUpdateFound, { once: true });

    // This function probably returns value in any case.
    timeoutID = window.setTimeout(() => {
      reg.removeEventListener('updatefound', onUpdateFound, false);
      resolve(null);
    }, 8000);
  });
}

export async function register(url: string, newSWIsReadyCallback?: () => void) {
  const reg = await navigator.serviceWorker.register(url);

  if (!newSWIsReadyCallback) return;

  // If this page is not controlled by any service worker, new one will be
  // installed.
  if (!navigator.serviceWorker.controller) return;

  navigator.serviceWorker.addEventListener(
    'controllerchange',
    onControllerChange,
    { once: true }
  );

  if (reg.waiting) {
    // Already waiting new service worker has been detected.
    newSWIsReadyCallback();
  } else {
    const newSW = await getNewServiceWorker(reg);

    if (newSW) {
      // Wait for change new service worker's state to `installed`
      return new Promise<void>((resolve) => {
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed') {
            newSWIsReadyCallback();
            resolve();
          }
        });
      });
    }
  }
}

export async function sendSkipWaitingMessage(): Promise<void> {
  return navigator.serviceWorker.getRegistration().then((reg) => {
    if (!reg || !reg.waiting) return;
    reg.waiting.postMessage('skipWaiting');
  });
}
