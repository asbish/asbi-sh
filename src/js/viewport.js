import 'intersection-observer';

function observe(elems, cb, opt=Object.create(null)) {
  const observer = new IntersectionObserver(cb, opt);
  for (let i = 0; i < elems.length; ++i) {
    observer.observe(elems[i]);
  }
}

let resizeTimeout;
const resizeCbs = [];

function call(l) {
  for (let i = 0; i < l.length; ++i) {
    l[i]();
  }
}

function subscribeResize(cb) {
  resizeCbs.push(cb);
  cb();
}

function unsubscribeResize(cb) {
  for (let i = 0; i < resizeCbs.length; ++i) {
    if (cb === resizeCbs[i]) {
      resizeCbs.splice(i, 1);
      return;
    }
  }
}

window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(call(resizeCbs), 200);
}, {passive: true});

export {
  observe,
  subscribeResize,
  unsubscribeResize,
};
