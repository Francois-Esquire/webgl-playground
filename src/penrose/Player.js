import { EventDispatcher } from "three/src/core/EventDispatcher";
import { MeshPhysicalMaterial } from "three/src/materials/MeshPhysicalMaterial";
import { SphereGeometry } from "three/src/geometries/SphereGeometry";
import { Mesh } from "three/src/objects/Mesh";

export default class Player {
  constructor(program, position) {
    this.program = program;

    this.events = new EventDispatcher();

    const material = new MeshPhysicalMaterial({
      color: 0xff3322,
      roughness: 0.75,
      metalness: 0.0625,
      clearCoat: 0.27
    });

    const geometry = new SphereGeometry(5, 100, 100);

    this.changeMesh(new Mesh(geometry, material), position);

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
    console.log(raycast, raycast.object.position, this.mesh.position);

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
    this.mesh.position.set(x, y, z);
  }

  loadBunny(position) {
    this.program.loadObj("assets/bunny.obj").then(object => {
      object.traverse(child => {
        if (child instanceof Mesh) {
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
