import THREE from "three";

import Player from "../Player";

export default class Penrose {
  constructor(program) {
    const player = new Player(program, { x: 10, y: 30, z: 10 });

    this.program = program;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("skyblue");

    const paths = [
      { direction: "up", count: 7 },
      { direction: "right", count: 7 },
      { direction: "down", count: 3 },
      { direction: "left", count: 3 }
    ];

    this.waypoints = this.createStaircase(paths);
    this.lights = this.createLights(this.scene);

    [].concat(this.lights, this.waypoints).forEach(o => this.scene.add(o));

    this.changePlayer(player);

    player.on("player", ({ player }) => this.changePlayer(player));

    program
      .on("mousedown", this.onMouseDown.bind(this))
      .on("keydown", this.onKeyDown.bind(this));
  }

  changePlayer(player) {
    if (this.player)
      this.scene.remove(this.scene.getObjectByName(this.player.mesh.name));

    this.player = player;

    if (this.spotlight) this.spotlight.target = player.mesh;

    this.scene.add(player.mesh);
  }

  moveToWaypoint(raycast) {
    const { player, spotlight } = this;

    player.move(raycast);

    spotlight.position.set(
      player.mesh.position.x,
      spotlight.position.y,
      player.mesh.position.z
    );

    const direction = new THREE.Vector3(
      Math.Infinity - this.player.mesh.position.x,
      20,
      this.player.mesh.position.z + 100
    );

    const path = new THREE.LineCurve(player.mesh.position, direction);

    const material = new THREE.LineBasicMaterial({
      color: 0xff0000
    });

    // can serve as animation path.

    const pathObject = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(path.getPoints()),
      material
    );

    this.scene.add(pathObject);

    setTimeout(() => this.scene.remove(pathObject), 2000);

    // const curve = new THREE.CatmullRomCurve3([
    //   new THREE.Vector3(-10, 0, 10),
    //   new THREE.Vector3(-5, 5, 5),
    //   new THREE.Vector3(0, 0, 0),
    //   new THREE.Vector3(5, -5, 5),
    //   new THREE.Vector3(10, 0, 10)
    // ]);

    // const points = curve.getPoints(50);
    // const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // // Create the final object to add to the scene
    // const curveObject = new THREE.Line(geometry, material);

    // scene.add(curveObject);
  }

  createLights() {
    const lights = [];

    const ambience = new THREE.AmbientLight(0x0f0f0f, 10.5);
    lights.push(ambience);

    const light = new THREE.DirectionalLight(0xffffff, 2.0);

    light.position.set(-600, 1000, -11600);

    light.target = this.scene;
    light.castShadow = true;
    light.shadow.bias = 0.000001;
    light.shadow.mapSize = new THREE.Vector2(2048 * 2, 2048 * 2);
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    light.shadow.camera.left = -500;
    light.shadow.camera.bottom = -500;
    light.shadow.camera.right = 500;
    light.shadow.camera.top = 500;

    lights.push(light);

    const spotlight = new THREE.SpotLight(
      0xffffff,
      4.0,
      5000,
      Math.PI / 4,
      0.6125,
      0.125
    );
    spotlight.position.y = 300;
    spotlight.position.x = 0;
    spotlight.position.z = 0;
    spotlight.castShadow = true;
    spotlight.shadow.bias = 0.000001;
    spotlight.shadow.mapSize = new THREE.Vector2(2048 * 2, 2048 * 2);

    this.spotlight = spotlight;

    lights.push(spotlight);

    return lights;
  }

  createPenrose(position = new THREE.Vector3(0, 0, 0)) {
    const waypoints = [];

    for (let l = 0; l < 4; l++) {
      const dir = l % 2 ? "left" : "right";
      // 4 complete staircases.
      for (let i = 0; i < 24; i++) {
        if (dir === "left") {
        }
      }
    }

    return waypoints;
  }

  createStaircase(paths) {
    const waypoints = [];

    const slab = new THREE.BoxBufferGeometry(10, 1.5, 10);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.75,
      clearCoat: 1.1,
      clearCoatRoughness: 0.1
    });

    if (paths) {
      paths.forEach(p => {
        switch (p.direction) {
          default:
            break;
          case "up":
            for (let i = 0; i <= p.count; i++) {
              const x = 10 * (i + 1);
              const y = 2 * i;
              const z = 0;

              const mesh = this.createWaypoint(material, slab, x, y, z);

              waypoints.push(mesh);
            }
            break;
          case "right":
            for (let i = 0; i <= p.count; i++) {
              const x = 0;
              const y = 2 * i;
              const z = 10 * (i - 1);

              const mesh = this.createWaypoint(material, slab, x, y, z);

              waypoints.push(mesh);
            }
            break;
          case "down":
            for (let i = 0; i < p.count; i++) {
              const x = 10 * i * -1;
              const y = 2 * i;
              const z = 0;

              const mesh = this.createWaypoint(material, slab, x, y, z);

              waypoints.push(mesh);
            }
            break;
          case "left":
            for (let i = 0; i < p.count; i++) {
              const x = 0;
              const y = -2 * i; // for going up or down
              const z = 10 * i * 1;

              const mesh = this.createWaypoint(material, slab, x, y, z);

              waypoints.push(mesh);
            }
            break;
        }
      });
    } else {
      const count = 7;

      for (let i = 0; i <= count; i++) {
        const x = 10 + 10 * i;
        const y = 0 + 2 * i;
        const z = 10 + (i + 5);

        const mesh = this.createWaypoint(material, slab, x, y, z);

        waypoints.push(mesh);
      }
    }

    return waypoints;
  }

  createWaypoint(material, slab, x, y, z) {
    const mesh = new THREE.Mesh(slab, material);

    mesh.name = `point-${x}.${y}.${z}`;

    mesh.position.set(x, y, z);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  onMouseDown(event) {
    const { raycaster, mouse, camera } = event;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(this.waypoints);

    if (intersects.length > 0) {
      for (let i in intersects) {
        this.moveToWaypoint(intersects[i]);
      }
    }
  }

  onKeyDown(event) {
    const { keyCode, shiftKey } = event;
  }
}
