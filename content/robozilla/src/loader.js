'use strict';

import {JSONLoader, TextureLoader} from 'three';

const jsonLoader = new JSONLoader();
const textureLoader = new TextureLoader();

export function loadGeometry(json) {
  return new Promise((resolve, reject) => {
    jsonLoader.load(
      json,
      resolve,
      () => null,
      reject,
    );
  });
}

export function loadTexture(texture) {
  return new Promise((resolve, reject) => {
    textureLoader.load(
      texture,
      resolve,
      () => null,
      reject,
    );
  });
}
