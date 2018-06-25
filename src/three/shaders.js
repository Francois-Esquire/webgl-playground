import THREE from "three";

import fragmentShader from "./shaders/fragment.glsl";
import vertexShader from "./shaders/vertex.glsl";

class Shaders {
  constructor(opts) {
    const { canvas, antialias } = opts;

    this.delta = 0;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias
    });

    this.renderer.setClearColor(0xffffff);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.01,
      3000
    );

    this.scene = new THREE.Scene();

    const uniforms = { delta: { value: this.delta } };

    this.material = new THREE.ShaderMaterial({
      uniforms,
      fragmentShader,
      vertexShader
    });

    this.render = this.render.bind(this);

    this.start();
  }

  start() {
    const { scene, material } = this;

    const ambience = new THREE.AmbientLight(0xffffff, 0.5);

    scene.add(ambience);

    const point = new THREE.PointLight(0xffffff, 0.5);

    scene.add(point);

    const plane = new THREE.PlaneGeometry(10000, 10000, 100, 100);
    const planeMesh = new THREE.Mesh(plane, material);
    planeMesh.rotation.x = (-90 * Math.PI) / 180;
    planeMesh.position.y = -100;
    scene.add(planeMesh);

    const sphere = new THREE.SphereGeometry(50, 50, 100);
    const sphereMesh = new THREE.Mesh(sphere, material);
    sphereMesh.position.z = -1000;
    sphereMesh.position.x = 100;
    scene.add(sphereMesh);

    var cube = new THREE.BoxBufferGeometry(100, 100, 100, 10, 10, 10);
    this.mesh = new THREE.Mesh(cube, material);
    this.mesh.position.set(-100, 0, -1000);
    scene.add(this.mesh);

    this.vertexDisplacement = new Float32Array(cube.attributes.position.count);

    for (let i = 0; i < this.vertexDisplacement.length; i++) {
      this.vertexDisplacement[i] = Math.sin(i);
    }

    cube.addAttribute(
      "vertexDisplacement",
      new THREE.BufferAttribute(this.vertexDisplacement, 1)
    );

    this.render();
  }

  update() {
    this.delta += 0.01;

    this.material.uniforms.delta.value = 0.5 + Math.sin(this.delta) * 0.5;

    for (let i = 0; i < this.vertexDisplacement.length; i++) {
      this.vertexDisplacement[i] = 0.5 + Math.sin(i * this.delta) * 0.5;
    }

    this.mesh.geometry.attributes.vertexDisplacement.needsUpdate = true;
  }

  render() {
    this.update();

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render);
  }
}

window.shaders = new Shaders({
  canvas: document.getElementById("c"),
  antialias: true
});
