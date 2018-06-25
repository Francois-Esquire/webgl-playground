import THREE from "three";

class Materials {
  constructor(opts) {
    const { canvas, antialias } = opts;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias
    });

    this.renderer.setClearColor(0x000000);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.01,
      3000
    );

    this.scene = new THREE.Scene();

    this.render = this.render.bind(this);

    this.start();
  }

  start() {
    const { scene } = this;

    const ambience = new THREE.AmbientLight(0xffffff, 0.5);

    scene.add(ambience);

    const point = new THREE.PointLight(0xffffff, 0.5);

    scene.add(point);

    const material = new THREE.MeshStandardMaterial({
      color: 0xf3e66a,
      roughness: 0.5,
      metalness: 0.5
    });

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

    const cube = new THREE.BoxGeometry(100, 100, 100);
    this.mesh = new THREE.Mesh(cube, material);
    this.mesh.position.set(-100, 0, -1000);
    scene.add(this.mesh);

    this.render();
  }

  update() {
    this.mesh.rotation.x += 0.1;
    this.mesh.rotation.y += 0.1;
  }

  render() {
    this.update();

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render);
  }
}

window.materials = new Materials({
  canvas: document.getElementById("c"),
  antialias: true
});
