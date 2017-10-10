'use strict';

export default () => {
  try {
    var elem = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && elem.getContext('webgl'));
  } catch (e) {
    return false;
  }
};
