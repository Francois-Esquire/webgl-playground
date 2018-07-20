import { DirectionalLight } from "three/src/lights/DirectionalLight";
import { LineBasicMaterial } from "three/src/materials/LineBasicMaterial";
import { PointsMaterial } from "three/src/materials/PointsMaterial";
import { Points } from "three/src/objects/Points";
import { Line } from "three/src/objects/Line";
import { Geometry } from "three/src/core/Geometry";
import { Vector3 } from "three/src/math/Vector3";

export default class Strung {
  constructor(program) {
    this.program = program;

    this.context = new AudioContext();

    this.start();
  }

  start() {
    const { scene } = this.program;

    // add lights
    const light = new DirectionalLight(0xffffff, 0.5);

    scene.add(light);

    this.createStrings();

    // sync with audio api.

    this.program.on("mousedown", this.onMouseDown.bind(this));
  }

  createStrings() {
    const { scene } = this.program;

    const points = this.createPoints();

    const material = new LineBasicMaterial({
      color: 0xffffff
    });

    const dotMaterial = new PointsMaterial({
      size: 5,
      sizeAttenuation: false
    });

    const geometry = new Geometry();

    points.forEach(p => {
      geometry.vertices.push(p);
    });

    const dots = new Points(geometry, dotMaterial);
    const line = new Line(geometry, material);

    this.lines = [line];

    scene.add(dots);
    scene.add(line);
  }

  createPoints() {
    const { camera } = this.program;
    // use the camera left, right to define ending anchors for lines.
    //
    return [
      new Vector3(camera.left, 0, 0),
      new Vector3(0, 0, 0),
      new Vector3(camera.right, 0, 0)
    ];
  }

  onMouseDown(event) {
    const { raycaster, mouse, camera } = event;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(this.lines);

    if (intersects.length > 0) {
      for (let i in intersects) {
        const target = intersects[i];
        console.log(target);
        target.object.geometry.vertices[1] = target.point;
        target.object.geometry.vertices.verticesNeedUpdate = true;
      }
    }
  }
}
