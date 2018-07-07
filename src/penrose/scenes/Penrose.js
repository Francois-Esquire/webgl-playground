import THREE from "three";

import Player from "../Player";

export default class Penrose {
  constructor(program) {
    this.program = program;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f0f0f);
    // this.scene.background = new THREE.Color('skyblue');

    this.start();
  }

  start() {
    const { program, scene } = this;

    this.lights = this.createLights(scene);

    this.points = this.createPoints(false);

    [].concat(this.lights, this.points).forEach(o => scene.add(o));

    // console.log("last point:", this.points[this.points.length - 1]);

    this.changePlayer({
      player: new Player(program, this.points[this.points.length - 1].position)
    });

    program
      .on("mousedown", this.onMouseDown.bind(this))
      .on("keydown", this.onKeyDown.bind(this));
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

  createPoints(plot) {
    const points = [].concat(
      this.createPenrose(undefined, undefined, 0),
      this.createPenrose("right", new THREE.Vector3(-40, -20.5, -60))
    );

    if (plot) this.plotPoints(this.points);

    const height = 0;
    const dim = 10;

    const geometry = new THREE.BoxBufferGeometry(dim, height, dim);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.75,
      clearCoat: 1.1,
      clearCoatRoughness: 0.1
    });

    return points.map(p => {
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(p.x, p.y - height / 2, p.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      return mesh;
    });
  }

  // vec3[]
  plotPoints(points) {
    const { scene } = this;

    const material = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });

    const dotMaterial = new THREE.PointsMaterial({
      size: 5,
      sizeAttenuation: false
    });

    const plot = new THREE.Geometry();
    const geometry = new THREE.Geometry();

    points.forEach(p => {
      plot.vertices.push(new THREE.Vector3(p.x, 0, p.z));
      geometry.vertices.push(p);
    });

    const grid = new THREE.Points(plot, dotMaterial);
    const dots = new THREE.Points(geometry, dotMaterial);
    const line = new THREE.Line(geometry, material);

    // project grid as 2d plane for traversal.
    scene.add(grid);
    scene.add(dots);
    scene.add(line);
  }

  // based on direction/orientation - move L according.
  // use offset to move staircase up
  // keep in mind starting position of next set, keep track of last point.
  // also consider winding
  // pack this all in a recursive function
  createPenrose(wind = "left", vec3 = new THREE.Vector3(), offset = 0) {
    const points = [];

    const factor = 10;
    const scale = 2.125;
    const count = 14;

    let y = vec3.y;
    let x = vec3.x + offset;
    let z = vec3.z + offset;

    let i = 0;
    while (i <= count) {
      if (i) y += scale;

      // skip first point if equal to count

      if (wind === "left") {
        switch (true) {
          case 0:
            break;
          case i < 3:
            z = z - factor;
            break;
          case i < 5:
            x = x - factor;
            break;
          case i < 10:
            z = z + factor;
            break;
          default:
            x = x + factor;
            break;
        }
      } else {
        switch (true) {
          case 0:
            break;
          case i < 3:
            x = x - factor;
            break;
          case i < 5:
            z = z - factor;
            break;
          case i < 10:
            x = x + factor;
            break;
          default:
            z = z + factor;
            break;
        }
      }

      // y can also be scale factor for player.
      // have it move in a linear fashion up.
      // y += i * 0.285;
      // console.log(i, y);

      points.push(new THREE.Vector3(x, y, z));

      i++;
    }

    return points;
  }

  changePlayer({ player }) {
    if (this.player) {
      this.player.off("player", this.changePlayer.bind(this));

      this.scene.remove(this.scene.getObjectByName(this.player.mesh.name));
    } else player.on("player", this.changePlayer.bind(this));

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

    // const direction = new THREE.Vector3(
    //   Math.Infinity - this.player.mesh.position.x,
    //   20,
    //   this.player.mesh.position.z + 100
    // );

    // const path = new THREE.LineCurve(player.mesh.position, direction);

    // const material = new THREE.LineBasicMaterial({
    //   color: 0xff0000
    // });

    // // can serve as animation path.

    // const pathObject = new THREE.Line(
    //   new THREE.BufferGeometry().setFromPoints(path.getPoints()),
    //   material
    // );

    // this.scene.add(pathObject);

    // setTimeout(() => this.scene.remove(pathObject), 2000);
  }

  createStaircase() {
    const paths = [
      { direction: "up", count: 7 },
      { direction: "right", count: 7 },
      { direction: "down", count: 3 },
      { direction: "left", count: 3 }
    ];

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

    const intersects = raycaster.intersectObjects(this.points);

    if (intersects.length > 0) {
      for (let i in intersects) {
        this.moveToWaypoint(intersects[i]);
      }
    }
  }

  onKeyDown(event) {
    const { scene, player } = this;
    const { keyCode, shiftKey, raycaster } = event;

    console.log(keyCode);

    // TODO:
    // find the nearest waypoint from player and move player
    const vec = new THREE.Vector3(0, 0, 0);

    switch (keyCode) {
      default:
        break;
      case 188:
        player.changePosition({
          y: player.mesh.position.y - 1
        });
        break;
      case 190:
        player.changePosition({
          y: player.mesh.position.y + 1
        });
        break;
      case 37:
        if (shiftKey) player.mesh.position.z += 1;
        else
          console.log(
            new THREE.Ray(player.mesh.position).intersectsSphere(
              new THREE.SphereBufferGeometry(40, 32, 32)
            ),
            "z += 1"
          );
        break;
      case 38:
        if (shiftKey) player.mesh.position.x -= 1;
        else {
          const direction = new THREE.Vector3(
            Math.Infinity - this.player.mesh.position.x,
            200,
            this.player.mesh.position.z
          );

          raycaster.set(this.player.mesh.position, direction);
          raycaster.ray.recast(600.75);

          const intersects = raycaster.intersectObjects(this.waypoints);

          console.log(intersects, direction, this.player.mesh.position);

          if (intersects.length > 0) {
            for (let i in intersects) {
              this.moveToWaypoint(intersects[i]);
            }
          }
        }
        break;
      case 39:
        if (shiftKey) player.mesh.position.z -= 1;
        else console.log("z -= 1");
        break;
      case 40:
        if (shiftKey) player.mesh.position.x += 1;
        else console.log("x += 1");
        break;
    }

    return false;
  }
}
