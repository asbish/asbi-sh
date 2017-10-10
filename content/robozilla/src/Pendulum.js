'use strict';

import {
  Geometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three';

export default class Pendulum {
  constructor(scene, bobGeo, bobTexture, energyGeo, mass, length, theta) {
    this.g = 9.81;
    this.d = 0.005;

    this.alpha = 0;
    this.omega = 0;
    this.theta = theta;

    this.E = 0;
    this.maxE = null;
    this.luminanceE = 0;

    this.scale = 50;
    this.mass = mass;
    this._mass = mass ** 0.333;
    this.length = length / this.scale;

    this.group = new Group();
    this.group.position.set(0, length, 0);

    const ropeGeo = new Geometry();
    ropeGeo.vertices.push(new Vector3(0, -length, 0));
    ropeGeo.vertices.push(new Vector3(0, 0, 0));
    const ropeMat = new LineBasicMaterial({color: 0xbbbbbb, linewidth: 1});
    this.group.add(new LineSegments(ropeGeo, ropeMat));

    this.bob = new Mesh(bobGeo, new MeshBasicMaterial({map: bobTexture}));
    this.bob.position.set(0, -length, 0);
    this.bobE = new Mesh(energyGeo, new MeshBasicMaterial({color: 0x000000}));
    this.bob.add(this.bobE);
    this.group.add(this.bob);

    scene.add(this.group);
  }

  update(deltaTime) {
    this.theta += this.omega * deltaTime + 0.5 * this.alpha * deltaTime ** 2;
    const alpha = -(this.g / this.length) * Math.sin(this.theta);
    this.omega += 0.5 * (alpha + this.alpha) * deltaTime;
    this.omega -= this.d / this._mass * this.omega;
    this.alpha = alpha;

    const P = this.mass * this.g * this.length * (1 - Math.cos(this.theta));
    const K = 0.5 * this.mass * (this.length * this.omega) ** 2;
    this.E = P + K;

    if (!this.maxE || this.maxE < this.E) {
      this.maxE = this.E;
      this.luminanceE = 0.5 / this.E;
    }
    this.bobE.material.color.setHSL(0.91, 1, this.E * this.luminanceE);

    this.group.rotation.set(0, 0, this.theta);
    this.bob.rotateY(0.03 * this.theta);
  }

  reboot(x) {
    const o = Math.abs(this.omega);
    this.omega = o === 0 ? 1 * x : this.omega / o * x;
    this.maxE = null;
  }

  getBob(scene) {
    return [scene.children[0].children[1]];
  }
}
