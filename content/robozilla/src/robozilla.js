import {
  OrthographicCamera,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
} from 'three';
import Pendulum from './Pendulum';
import detectCanvas from './detectCanvas';
import deltaTime from './deltaTime';
import { loadGeometry, loadTexture } from './loader';
import robotJSON from '../assets/bob/robot.json';
import robotTexture from '../assets/bob/robot-texture.jpg';
import robotPartsJSON from '../assets/bob/robot-parts.json';

import './robozilla.css';

let width = document.getElementById('robozilla-cntr').clientWidth;
const height = 300;

const scene = new Scene();
const camera = new OrthographicCamera(
  width / -2,
  width / 2,
  height / 2,
  height / -2,
  1,
  1000,
);
const mouse = new Vector2();
const raycaster = new Raycaster();
const renderer = new WebGLRenderer({ alpha: true });

let pendulum;
let timeout;

function animate() {
  pendulum.update(deltaTime());
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function mouseDown(e) {
  e.preventDefault();
  const canvas = this.firstElementChild.getClientRects()[0];
  if (e.clientX > canvas.left
      && e.clientX < canvas.right
      && e.clientY > canvas.top
      && e.clientY < canvas.bottom) {
    mouse.set(
      (e.clientX - canvas.left) / width * 2 - 1,
      -((e.clientY - canvas.top) / height) * 2 + 1,
    );
    raycaster.setFromCamera(mouse, camera);
    if (raycaster.intersectObjects(Pendulum.getBob(scene)).length > 0) {
      pendulum.reboot(1);
    }
  }
}

function resize() {
  width = document.getElementById('robozilla-cntr').clientWidth;
  camera.left = width / -2;
  camera.right = width / 2;
  camera.top = height / 2;
  camera.bottom = height / -2;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

if (detectCanvas()) {
  const random = Math.random() - 0.5;
  const thetaDirection = random === 0 ? 1 : random / Math.abs(random);
  Promise.all([
    loadGeometry(robotJSON),
    loadTexture(robotTexture),
    loadGeometry(robotPartsJSON),
  ]).then((x) => {
    pendulum = new Pendulum(
      scene,
      x[0],
      x[1],
      x[2],
      40,
      height / 2,
      0.5 * thetaDirection,
    );

    camera.position.set(0, 0, 500);
    renderer.setSize(width, height);
    renderer.setClearColor(0xffffff, 0);

    document.getElementById('robozilla-canvas')
      .appendChild(renderer.domElement);
    document.getElementById('robozilla-canvas')
      .addEventListener('mousedown', mouseDown, false);

    window.addEventListener('resize', () => {
      clearTimeout(timeout);
      timeout = setTimeout(resize, 200);
    }, false);

    animate();
  });
} else {
  document.getElementById('robozilla-canvas')
    .textContent = "Your browser doesn't support.";
}
