'use strict';

export default () => {
  try {
    const elem = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && elem.getContext('webgl'));
  } catch (e) {
    return false;
  }
};
