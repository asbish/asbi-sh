/* eslint-disable import/first */

import * as THREE from 'three';
// `three.min.js` on cdn doesn't have examples, so `GLTFLoader` includes this
// bundle. Cautionary points when require module, use `examples/js` to suppress
// loading THREE twice, not `examples/jsm`.
// Thanks: https://github.com/mrdoob/three.js/issues/14848
require('three/examples/js/loaders/GLTFLoader.js'); // -> THREE.GLTFLoader
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import ResizeObserver from 'resize-observer-polyfill';

import Pendulum from './pendulum';
import PendulumBannerElement from './pendulum-banner-element';

const DEFAULT_DELTA_TIME = 1 / 60;

type BobSource = string | null;

const bobRegex = /^\/.+\.gltf$/;
function isBobSource(src: BobSource): src is string {
  if (!src) return false;
  return bobRegex.test(src);
}

const gltfLoader = new GLTFLoader();
function loadGLTF(src: string): Promise<GLTF> {
  return new Promise((resolve, reject) => {
    gltfLoader.load(src, resolve, () => {}, reject);
  });
}

class PendulumRenderElement extends HTMLElement {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly camera: THREE.OrthographicCamera;
  private readonly scene: THREE.Scene;
  private readonly mouse: THREE.Vector2;
  private readonly raycaster: THREE.Raycaster;

  private readonly banner: PendulumBannerElement;
  private readonly resizeObserver: ResizeObserver;

  private pendulum: Pendulum | null = null;
  private rAFID: number | null = null;
  private rAFLastTime: number | null = null;

  private rendered = false;
  private current: BobSource = null;
  private loading = false;

  constructor() {
    super();

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.outputEncoding = THREE.GammaEncoding;
    this.renderer.setClearColor(0xffffff, 0);

    this.camera = new THREE.OrthographicCamera(0, 0, 0, 0, 1, 1000);
    this.camera.position.set(0, 0, 500);

    this.scene = new THREE.Scene();
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    this.banner = new PendulumBannerElement();

    // Bind
    this.animatePendulum = this.animatePendulum.bind(this);
    this.handleMousedown = this.handleMousedown.bind(this);
    this.handleResize = this.handleResize.bind(this);

    this.addEventListener('mousedown', this.handleMousedown);
    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this);
  }

  get src(): BobSource {
    return this.getAttribute('src');
  }

  set src(value: BobSource) {
    if (value) {
      this.setAttribute('src', value);
    } else {
      this.removeAttribute('src');
    }
  }

  connectedCallback() {
    if (this.rendered) return;
    this.rendered = true;

    this.classList.add('pendulum-render');

    const { width, height } = this.getBoundingClientRect();
    this.adjustDisplay(width, height);
    this.appendChild(this.renderer.domElement);

    this.appendChild(this.banner);

    if (isBobSource(this.src)) {
      this.updatePendulum(this.src);
    } else {
      this.banner.sendMessage('🤖 Click any icons');
    }
  }

  disconnectedCallback() {
    this.removePendulum();

    this.removeChild(this.renderer.domElement);
    this.renderer.dispose();

    this.resizeObserver.disconnect();
  }

  private removePendulum() {
    if (this.rAFID !== null) {
      cancelAnimationFrame(this.rAFID);
    }

    if (this.pendulum) {
      this.pendulum.free(this.scene);
      this.pendulum = null;
      this.renderer.render(this.scene, this.camera);
    }

    // DEBUG: console.log(this.renderer.info);
  }

  static get observedAttributes() {
    return ['src'];
  }

  attributeChangedCallback(name: string, _: BobSource, newValue: BobSource) {
    if (name === 'src') {
      if (newValue === this.current) {
        // Prevent unnecessary fetch or infinity call.
        return;
      }

      if (this.loading) {
        // TODO: feel unsavory.
        this.src = this.current;
        return;
      }

      if (isBobSource(newValue)) {
        this.updatePendulum(newValue);
      }
    }
  }

  private async updatePendulum(src: string): Promise<void> {
    this.loading = true;
    this.current = src;

    this.banner.sendMessage('👻 Loading...', { delay: 500 });

    this.removePendulum();

    return loadGLTF(src)
      .then((gltf) => {
        this.pendulum = new Pendulum(this.scene, gltf.scene);
        this.animatePendulum();

        this.loading = false;
        this.banner.sendMessage(null);
      })
      .catch((e: ProgressEvent) => {
        this.loading = false;
        this.current = null;

        const req = e.target as XMLHttpRequest;
        if (req.status === 0) {
          this.banner.sendMessage('💀 Network error');
        } else {
          this.banner.sendMessage(`💀 Error status: ${req.status}`);
        }
      });
  }

  private animatePendulum() {
    if (!this.pendulum) return;

    const now = Date.now();

    const deltaTime = this.rAFLastTime
      ? Math.min(DEFAULT_DELTA_TIME, 1 / (1000 / (now - this.rAFLastTime)))
      : DEFAULT_DELTA_TIME;

    this.rAFLastTime = now;

    this.pendulum.update(deltaTime);
    this.renderer.render(this.scene, this.camera);

    this.rAFID = requestAnimationFrame(this.animatePendulum);
  }

  private handleMousedown(e: MouseEvent) {
    e.preventDefault();

    if (!this.pendulum) return;

    const { left, top, width, height } = this.getBoundingClientRect();
    this.mouse.set(
      ((e.clientX - left) / width) * 2 - 1,
      -((e.clientY - top) / height) * 2 + 1
    );
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.pendulum.intersect(this.raycaster);
  }

  private handleResize(entries: ResizeObserverEntry[]) {
    const { width, height } = entries[0].contentRect;
    this.adjustDisplay(width, height);
  }

  private adjustDisplay(width: number, height: number) {
    this.renderer.setSize(width, height);

    this.camera.left = width / -2;
    this.camera.right = width / 2;
    this.camera.top = height / 2;
    this.camera.bottom = height / -2;
    this.camera.updateProjectionMatrix();
  }
}

if (!window.customElements.get('pendulum-render')) {
  window.customElements.define('pendulum-render', PendulumRenderElement);
}

export default PendulumRenderElement;
