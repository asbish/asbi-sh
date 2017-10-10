'use strict';

let last;
const _deltaTime = 1 / 60;

export default () => {  // use DOMHighResTimeStamp or not?
  const now = Date.now();
  if (!last) { last = now + _deltaTime; }
  const deltaTime = Math.min(_deltaTime, 1 / (1000 / (now - last)));
  last = now;
  return deltaTime;
};
