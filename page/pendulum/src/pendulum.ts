import * as THREE from 'three';

function randomDirection() {
  const random = Math.random() - 0.5;
  return random === 0 ? 1 : random / Math.abs(random);
}

export default class Pendulum {
  private readonly g = 9.81; // Gravity
  private readonly fr = 0.05; // Friction
  private readonly mass: number;
  private readonly ropeLength: number;

  private theta = 0.5 * randomDirection();
  private alpha = 0;
  private omega = 0;
  private luminance = 0;
  private swinged = false;

  private readonly group = new THREE.Group();
  private readonly bobGroup = new THREE.Group();
  private readonly intersectMesh: THREE.Mesh | null = null;
  private readonly energyMesh: THREE.Mesh | null = null;

  constructor(
    scene: THREE.Scene,
    bob: THREE.Group,
    mass = 50, // Kg
    ropeLength = 1.5 // M
  ) {
    this.mass = mass;
    this.ropeLength = ropeLength;

    // Sloppy conversion meter to px
    const ropeLengthPx = ropeLength * 100;

    // Create rope
    const ropeGeo = new THREE.Geometry();
    ropeGeo.vertices.push(new THREE.Vector3(0, -ropeLengthPx, 0));
    ropeGeo.vertices.push(new THREE.Vector3(0, 0, 0));
    const ropeMat = new THREE.LineBasicMaterial({
      color: 0xbbbbbb,
      linewidth: 1
    });
    this.group.add(new THREE.LineSegments(ropeGeo, ropeMat));

    // Move meshes (gltf.scene.children) into group.
    let len = bob.children.length;
    while (len > 0) {
      const mesh = bob.children.pop() as THREE.Mesh;

      // If the material has texture, adjust brightness.
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat.emissiveMap) {
        mat.emissive.setRGB(2, 2, 2);
      }

      if (/body/.test(mesh.name)) {
        this.intersectMesh = mesh;
      }

      if (/energy/.test(mesh.name)) {
        this.energyMesh = mesh;
      }

      this.bobGroup.add(mesh);
      len--;
    }

    this.bobGroup.position.set(0, -ropeLengthPx, 0);
    this.group.add(this.bobGroup);

    this.group.position.set(0, ropeLengthPx, 0);
    scene.add(this.group);
  }

  // https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects
  // NOTE: I'm not sure if this is correct way.
  free(scene: THREE.Scene) {
    this.group.traverse((x) => {
      if (x.type === 'LineSegments') {
        const rope = x as THREE.LineSegments;
        rope.geometry.dispose();
        (rope.material as THREE.LineBasicMaterial).dispose();
      }

      if (x.type === 'Mesh') {
        const mesh = x as THREE.Mesh;
        mesh.geometry.dispose();

        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat.emissiveMap) {
          (mat.emissiveMap as THREE.Texture).dispose();
        }
        mat.dispose();
      }
    });

    scene.remove(this.group);
  }

  update(deltaTime: number): void {
    this.theta += this.omega * deltaTime + 0.5 * this.alpha * deltaTime ** 2;
    const alpha = -(this.g / this.ropeLength) * Math.sin(this.theta);
    this.omega += 0.5 * (alpha + this.alpha) * deltaTime;
    this.omega -= (this.fr / this.mass) * this.omega;
    this.alpha = alpha;

    const P = this.mass * this.g * this.ropeLength * (1 - Math.cos(this.theta));
    const K = 0.5 * this.mass * (this.ropeLength * this.omega) ** 2;
    const E = P + K;

    if (!this.swinged) {
      this.swinged = true;
      this.luminance = 0.5 / E;
    }

    if (this.energyMesh) {
      (this.energyMesh.material as THREE.MeshStandardMaterial).emissive.setHSL(
        0.91,
        1,
        E * this.luminance
      );
    }

    this.group.rotation.set(0, 0, this.theta);
    this.bobGroup.rotateY(0.03 * this.theta);
  }

  intersect(raycaster: THREE.Raycaster) {
    if (
      this.intersectMesh &&
      raycaster.intersectObjects([this.intersectMesh]).length > 0
    ) {
      // Reboot pendulum
      const o = Math.abs(this.omega);
      this.omega = o === 0 ? 1 : this.omega / o;
      this.swinged = false;
    }
  }
}
