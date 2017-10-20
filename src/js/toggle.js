export function toggleAttr(d, attr, vDef, v) {
  d.setAttribute(attr, d.getAttribute(attr) === v ? vDef : v);
}

export function toggleStyle(d, prop, vDef, v) {
  d.style[prop] = d.style[prop] === v ? vDef : v;
}

export function toggleTabIndexes(parent, query='a') {
  const xs = parent.querySelectorAll(query);
  for (let i = 0; i < xs.length; ++i) {
    const x = xs[i];
    x.setAttribute(
      'tabindex',
      x.getAttribute('tabindex') === '-1' ? '0' : '-1'
    );
  }
}
