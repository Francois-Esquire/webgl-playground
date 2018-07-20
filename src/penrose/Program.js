import { Vector2 } from "three/src/math/Vector2";
import { EventDispatcher } from "three/src/core/EventDispatcher";
import { Raycaster } from "three/src/core/Raycaster";
import { LoadingManager } from "three/src/loaders/LoadingManager";
import { OrthographicCamera } from "three/src/cameras/OrthographicCamera";
import { Scene } from "three/src/scenes/Scene";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { PCFShadowMap } from "three/src/constants";

import { OBJLoader } from "../examples/js/loaders/OBJLoader";
import { EffectComposer } from "../examples/js/postprocessing/EffectComposer";
import { RenderPass } from "../examples/js/postprocessing/RenderPass";
import { ShaderPass } from "../examples/js/postprocessing/ShaderPass";
import { GlitchPass } from "../examples/js/postprocessing/GlitchPass";
import { SobelOperatorShader } from "../examples/js/shaders/SobelOperatorShader";

export default class Program {
  constructor(scenes = [], options = {}) {
    this.options = options;
    this.clearColor = 0x0c0c0c;
    this.ticks = 0;

    this.assets = new Map();
    this.scenes = new Map();

    if (scenes && scenes.length)
      scenes.forEach(s => this.scenes.set(s.name, s));

    this.events = new EventDispatcher();
    this.loader = new LoadingManager();
    this.raycaster = new Raycaster();
    this.mouse = new Vector2();

    this.render = this.render.bind(this);

    this.init();
  }

  init() {
    const { first } = this.options;

    this.renderer = this.createRenderer();

    this.camera = this.createIsometricCamera();

    if (first) this.changeScene(first);
    else if (this.scenes.size >= 1) this.changeScene(this.scenes.values()[0]);
    else this.changeScene({ name: "default", scene: new Scene() });

    this.composer = this.createComposer();

    this.render();

    window.addEventListener("resize", this.onWindowResize.bind(this));
    document.addEventListener("keydown", this.onDocumentKeyDown.bind(this));
    document.addEventListener("mousedown", this.onDocumentMouseDown.bind(this));
    document.body.appendChild(this.renderer.domElement);
  }

  render() {
    requestAnimationFrame(this.render);

    this.update();

    this.composer.render();
  }

  update() {
    this.ticks++;

    this.events.dispatchEvent({ type: "update" });
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

  changeScene(scene) {
    if (typeof scene === "string")
      return this.changeScene(this.scenes.get(scene));
    else if (typeof scene === "function") {
      const _ = new scene(this, this.player);

      this.scenes.set(scene.name, _);

      return this.changeScene(_.scene);
    }

    this.scene = scene;

    if (this.renderPass) this.renderPass.scene = scene;

    if (this.camera) this.updateCamera(scene);
  }

  changeCamera(camera) {
    this.camera = camera;
    this.renderPass.camera = camera;

    // if (this.scene) this.updateCamera(this.scene);
  }

  updateCamera(scene) {
    this.camera.lookAt((this.scene || scene).position);
    this.camera.updateMatrix();
  }

  createComposer() {
    const { renderer, scene, camera, clearColor } = this;

    const composer = new EffectComposer(renderer);
    // composer.setSize(2048, 2048);

    const renderPass = new RenderPass(scene, camera);
    renderPass.clearColor = clearColor;

    const sobelPass = new ShaderPass(SobelOperatorShader);
    sobelPass.uniforms.resolution.value = new Vector2(2048, 2048);
    sobelPass.uniforms.tDiffuse.value = 0;

    const glitchPass = new GlitchPass(20);
    glitchPass.renderToScreen = true;
    glitchPass.uniforms.tDiffuse.value = 600;

    // composer.addPass(sobelPass);
    // composer.addPass(glitchPass);

    if (composer.passes.length < 1) renderPass.renderToScreen = true;
    if (composer.passes.length < 2) sobelPass.renderToScreen = true;

    composer.addPass(renderPass);

    this.renderPass = renderPass;

    return composer;
  }

  createRenderer() {
    const renderer = new WebGLRenderer({
      antialias: true
    });

    renderer.setClearColor(this.clearColor);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;

    return renderer;
  }

  createIsometricCamera() {
    const ratio = window.innerWidth / window.innerHeight;
    const distance = 80;
    const position = 100;

    const camera = new OrthographicCamera(
      -distance * ratio,
      distance * ratio,
      distance,
      -distance,
      0,
      500
    );

    camera.aspect = ratio;
    camera.position.set(position, position, position);

    return camera;
  }

  onDocumentMouseDown(event) {
    event.preventDefault();

    const { renderer, raycaster, mouse, camera } = this;

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    this.events.dispatchEvent({ type: "mousedown", mouse, camera, raycaster });
  }

  onDocumentKeyDown(event) {
    const { raycaster, mouse, camera } = this;
    const { keyCode, shiftKey } = event;

    this.events.dispatchEvent({
      type: "keydown",
      raycaster,
      mouse,
      camera,
      keyCode,
      shiftKey
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  loadObj(path, onProgress) {
    if (this.assets.has(path)) return Promise.resolve(this.assets.get(path));

    return new Promise((resolve, reject) => {
      const loader = new OBJLoader(this.loader);

      loader.load(
        path,
        object => {
          this.assets.set(path, object);

          console.log(object);
          return resolve(object);
        },
        onProgress,
        error => {
          console.log(error);

          return reject(error);
        }
      );
    });
  }
}
