import THREE from "three";

export default class Player {
  constructor(program, position) {
    this.program = program;

    this.events = new THREE.EventDispatcher();

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xff3322,
      roughness: 0.75,
      metalness: 0.0625,
      clearCoat: 0.27
    });

    const geometry = new THREE.SphereGeometry(5, 100, 100);

    this.changeMesh(new THREE.Mesh(geometry, material), position);

    this.init(position);
  }

  init(position) {
    // LOAD PLAYER
    this.loadBunny(position);
  }

  on(name, handler) {
    this.events.addEventListener(name, handler);

    return this;
  }
  off(name, handler) {
    this.events.removeEventListener(name, handler);

    return this;
  }
  dispatch(payload) {
    this.events.dispatchEvent(payload);

    return this;
  }

  move(raycast) {
    console.log(raycast, this.mesh.position);

    this.changePosition(raycast.object.position);

    return this;
  }

  changeMesh(mesh, position = {}) {
    if (this.mesh) {
    }
    console.log(mesh);
    mesh.name = "Player";

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.mesh = mesh;

    this.changePosition(position);
  }

  changePosition(position = {}) {
    const { x, y, z } = position;

    // interpolate from current position - add animation.
    if (x) this.mesh.position.x = x;
    if (y) this.mesh.position.y = y;
    if (z) this.mesh.position.z = z;
  }

  loadBunny(position) {
    this.program.loadObj("assets/bunny.obj").then(object => {
      object.traverse(child => {
        if (child instanceof THREE.Mesh) {
          const scale = 4;

          child.scale.set(scale, scale, scale);

          this.changeMesh(child, position);

          this.events.dispatchEvent({ type: "player", player: this });
        } else console.log("not a mesh", child);
      });
    });

    // LOAD AUDIO
  }
}
