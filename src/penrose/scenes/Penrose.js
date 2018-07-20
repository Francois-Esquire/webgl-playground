import { SpotLight } from "three/src/lights/SpotLight";
import { AmbientLight } from "three/src/lights/AmbientLight";
import { DirectionalLight } from "three/src/lights/DirectionalLight";
import { LineBasicMaterial } from "three/src/materials/LineBasicMaterial";
import { MeshPhysicalMaterial } from "three/src/materials/MeshPhysicalMaterial";
import { PointsMaterial } from "three/src/materials/PointsMaterial";
import { BoxBufferGeometry } from "three/src/geometries/BoxGeometry";
import { SphereBufferGeometry } from "three/src/geometries/SphereGeometry";
import { Geometry } from "three/src/core/Geometry";
import { Vector3 } from "three/src/math/Vector3";
import { Vector2 } from "three/src/math/Vector2";
import { Color } from "three/src/math/Color";
import { Ray } from "three/src/math/Ray";
import { Points } from "three/src/objects/Points";
import { Line } from "three/src/objects/Line";
import { Mesh } from "three/src/objects/Mesh";
import { Group } from "three/src/objects/Group";
import { Scene } from "three/src/scenes/Scene";

import Player from "../Player";

export default class Penrose {
  constructor(program) {
    this.program = program;

    this.scene = new Scene();
    this.scene.background = new Color(0x0f0f0f);

    this.start();
  }

  start() {
    const { program, scene } = this;

    this.level = new Group();

    this.points = this.createPoints(!false);

    this.navMesh = this.createNavMesh(this.points);

    this.points.forEach(o => this.level.add(o));

    this.lights = this.createLights(scene);

    [].concat(this.lights, this.level).forEach(o => scene.add(o));

    this.changePlayer({
      player: new Player(program, this.points[0].position)
    });

    program
      .on("mousedown", this.onMouseDown.bind(this))
      .on("keydown", this.onKeyDown.bind(this));
  }

  createLights() {
    const lights = [];

    const ambience = new AmbientLight(0x0f0f0f, 10.5);
    lights.push(ambience);

    const light = new DirectionalLight(0xffffff, 2.0);

    light.position.set(-600, 1000, -11600);

    light.target = this.scene;
    light.castShadow = true;
    light.shadow.bias = 0.000001;
    light.shadow.mapSize = new Vector2(2048 * 2, 2048 * 2);
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    light.shadow.camera.left = -500;
    light.shadow.camera.bottom = -500;
    light.shadow.camera.right = 500;
    light.shadow.camera.top = 500;

    lights.push(light);

    const spotlight = new SpotLight(
      0xffffff,
      4.0,
      5000,
      Math.PI / 6,
      0.6125,
      0.125
    );
    spotlight.position.y = 200;
    spotlight.position.x = 30;
    spotlight.position.z = 30;
    spotlight.castShadow = true;
    spotlight.shadow.bias = 0.000001;
    spotlight.shadow.mapSize = new Vector2(2048 * 2, 2048 * 2);

    this.spotlight = spotlight;

    lights.push(spotlight);

    return lights;
  }

  createPoints(plot) {
    // treat navigable path of points as a graph,
    // define relationships and attribute edges to each node within the graph.
    const offset = 50;

    const points = [].concat(
      this.createPenrose(undefined, undefined, offset),
      this.createPenrose("right", new Vector3(-40, -21.5, -60), offset),
      this.createPenrose("left", new Vector3(-82, -33.5, -42), offset),
      this.createPenrose("right", new Vector3(-121, -53.9, -101), offset)
    );

    if (plot) this.plotPoints(points);

    const height = 0;
    const dim = 10;

    const geometry = new BoxBufferGeometry(dim, height, dim);
    const material = new MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.75,
      clearCoat: 1.1,
      clearCoatRoughness: 0.1
    });

    return points.map(p => {
      const mesh = new Mesh(geometry, material);

      mesh.name = `point_${p.x}_${p.y}_${p.z}`;

      mesh.position.set(p.x, p.y, p.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      return mesh;
    });
  }

  // based on direction/orientation - move L according.
  // use offset to move staircase up
  // keep in mind starting position of next set, keep track of last point.
  // also consider winding
  // pack this all in a recursive function
  createPenrose(wind = "left", vec3 = new Vector3(), offset = 0) {
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
      // find intersects of new tiles

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

      if (i) points.push(new Vector3(x, y, z));

      i++;
    }

    return points;
  }

  createNavMesh(points) {
    // move all points up to an even level for traversal.
    // compose mesh with quads at each point.
    // join vertices and create a bufferGeometry.
    // handling movement on the mesh by intercepting click events,
    // as well as keydown,
    return points;
  }

  // vec3[]
  plotPoints(points) {
    const { scene } = this;

    const material = new LineBasicMaterial({
      color: 0x0ff0ff
    });

    const dotMaterial = new PointsMaterial({
      size: 5,
      sizeAttenuation: false
    });

    const plot = new Geometry();
    const geometry = new Geometry();

    points.forEach(p => {
      const node = new Vector3(p.x, p.y + 5, p.z);
      plot.vertices.push(node);
      geometry.vertices.push(node);
    });

    const grid = new Points(plot, dotMaterial);
    const dots = new Points(geometry, dotMaterial);
    const line = new Line(geometry, material);

    // project grid as 2d plane for traversal.
    scene.add(grid);
    scene.add(dots);
    scene.add(line);
  }

  penroseGraph(levels = 1, start = new Vector3(), offset = 0) {
    // track a graph
    // also include edges, think of how to represent as a data structure.
    const nodes = [];

    const factor = 10;
    const scale = 2.125;
    const count = 14;

    let y = start.y;
    let x = start.x + offset;
    let z = start.z + offset;

    for (let i = 0; i < levels; i++) {
      const dir = i % 2 === 0 ? "left" : "right";

      let n = 0;
      while (n <= count) {
        if (n) y += scale;

        // skip first point if equal to count
        // find intersects of new tiles

        if (dir === "left") {
          switch (true) {
            case 0:
              break;
            case n < 3:
              z = z - factor;
              break;
            case n < 5:
              x = x - factor;
              break;
            case n < 10:
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
            case n < 3:
              x = x - factor;
              break;
            case n < 5:
              z = z - factor;
              break;
            case n < 10:
              x = x + factor;
              break;
            default:
              z = z + factor;
              break;
          }
        }

        if (n) nodes.push(new Vector3(x, y, z));

        n++;
      }
    }

    return nodes;
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
    const { player } = this;

    player.move(raycast);
  }

  onMouseDown(event) {
    const { raycaster, mouse, camera } = event;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(this.points);

    if (intersects.length > 0) {
      this.moveToWaypoint(intersects[0]);
      // for (let i in intersects.reverse()) {
      //   this.moveToWaypoint(intersects[i]);
      // }
    }
  }

  onKeyDown(event) {
    const { player } = this;
    const { keyCode, shiftKey, raycaster } = event;

    console.log(keyCode);

    // TODO:
    // assumes movement by one,
    // find edge in the direction that the player directs to.
    const vec = player.position;

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
            new Ray(player.mesh.position).intersectsSphere(
              new SphereBufferGeometry(40, 32, 32)
            ),
            "z += 1"
          );
        break;
      case 38:
        if (shiftKey) player.mesh.position.x -= 1;
        else {
          const direction = new Vector2(
            player.mesh.position.x - 10,
            player.mesh.position.z
          );

          raycaster.setFromCamera(direction, this.program.camera);

          const intersects = raycaster.intersectObjects(this.points);

          console.log(intersects, direction, player.mesh.position);

          if (intersects.length > 0) {
            this.moveToWaypoint(intersects[0]);
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
