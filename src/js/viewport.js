let timeout;
let resizeTimeout;

const cbs = [];
const resizeCbs = [];

function subscribe(cb) {
  cbs.push(cb);
  cb();
}

function subscribeResize(cb) {
  resizeCbs.push(cb);
  cb();
}

function call(l) {
  for (let i = 0; i < l.length; ++i) {
    l[i]();
  }
}

function listner() {
  clearTimeout(timeout);
  timeout = setTimeout(call(cbs), 200);
}

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top <= window.innerHeight && rect.bottom >= 0;
}

window.addEventListener('scroll', listner, false);
window.addEventListener('resize', listner, false);

window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(call(resizeCbs), 200);
}, false);

export {
  subscribe,
  subscribeResize,
  isElementInViewport,
};
