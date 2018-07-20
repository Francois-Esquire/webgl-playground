import { Vector2 } from "three/src/math/Vector2";
import { EventDispatcher } from "three/src/core/EventDispatcher";
import { Raycaster } from "three/src/core/Raycaster";
import { OrthographicCamera } from "three/src/cameras/OrthographicCamera";
import { Scene } from "three/src/scenes/Scene";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";

import Strung from "./scenes/Strung";

export default class Program {
  constructor() {
    this.render = this.render.bind(this);

    this.events = new EventDispatcher();
    this.raycaster = new Raycaster();
    this.mouse = new Vector2();

    this.init();
  }

  init() {
    const { devicePixelRatio, innerHeight: height, innerWidth: width } = window;
    this.renderer = new WebGLRenderer({
      antialias: true
    });

    this.renderer.setClearColor(0x0c0c0c);
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(width, height);

    this.scene = new Scene();

    const ratio = window.innerWidth / window.innerHeight;
    const distance = 100;

    this.camera = new OrthographicCamera(
      -distance * ratio,
      distance * ratio,
      distance,
      -distance,
      0,
      1000
    );

    this.camera.aspect = ratio;

    this.strung = new Strung(this);

    this.render();

    window.addEventListener("resize", this.onWindowResize.bind(this));
    document.addEventListener("mousedown", this.onDocumentMouseDown.bind(this));
    document.addEventListener("mousemove", this.onDocumentMouseMove.bind(this));
    document.addEventListener("mouseup", this.onDocumentMouseMove.bind(this));
    document.body.appendChild(this.renderer.domElement);
  }

  render() {
    requestAnimationFrame(this.render);

    this.renderer.render(this.scene, this.camera);
  }

  on(name, handler) {
    this.events.addEventListener(name, handler);

    return this;
  }
  off(name, handler) {
    this.events.removeEventListener(name, handler);

    return this;
  }

  onDocumentMouseDown(event) {
    event.preventDefault();

    const { renderer, mouse, camera, raycaster } = this;

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    this.events.dispatchEvent({
      type: "mousedown",
      mouse,
      camera,
      raycaster
    });
  }

  onDocumentMouseMove(event) {
    event.preventDefault();

    const { renderer, mouse, camera, raycaster } = this;

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    this.events.dispatchEvent({
      type: "mousemove",
      mouse,
      camera,
      raycaster
    });
  }

  onDocumentMouseUp(event) {
    event.preventDefault();

    const { renderer, mouse, camera, raycaster } = this;

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    this.events.dispatchEvent({
      type: "mouseup",
      mouse,
      camera,
      raycaster
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
