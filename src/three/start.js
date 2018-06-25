import THREE from "three";

const canvas = document.getElementById("c");

const antialias = true;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias
});

renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.01,
  3000
);

const scene = new THREE.Scene();

const ambience = new THREE.AmbientLight(0xffffff, 0.5);

scene.add(ambience);

const point = new THREE.PointLight(0xffffff, 0.5);

scene.add(point);

var cube = new THREE.Boxcube(100, 100, 100);

var material = new THREE.MeshStandardMaterial({
  color: 0xf3e66a,
  roughness: 0.5,
  metalness: 0.5
});

var mesh = new THREE.Mesh(cube, material);
mesh.position.set(0, 0, -1000);

scene.add(mesh);

function start() {
  render();
}

function update() {
  mesh.rotation.x += 0.1;
  mesh.rotation.y += 0.1;
  // mesh.rotation.z += 0.1;
}

function render() {
  update();

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

start();

window.renderer = renderer;
