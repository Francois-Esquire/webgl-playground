import THREE from "three";

class Materials {
  constructor(opts) {
    const { canvas, antialias } = opts;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias
    });

    this.renderer.setClearColor(0x0c0c0c);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // this.camera = new THREE.OrthographicCamera(
    //   -500,
    //   500,
    //   400,
    //   -400,
    //   0.01,
    //   3000
    // );

    this.camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.01,
      3000
    );

    this.scene = new THREE.Scene();

    this.render = this.render.bind(this);

    this.delta = 0;

    this.start();
  }

  start() {
    const { scene, renderer, camera } = this;

    const material = new THREE.MeshStandardMaterial({
      // really ominous color with spot
      // color: 0x0f0f0f,
      color: 0xafafaf,
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
    sphereMesh.position.z = -100;
    sphereMesh.position.x = 200;
    sphereMesh.position.y = -50;
    scene.add(sphereMesh);

    const cube = new THREE.BoxGeometry(100, 100, 100);
    this.mesh = new THREE.Mesh(cube, material);
    this.mesh.position.set(-100, 0, -120);
    scene.add(this.mesh);

    // const ambience = new THREE.AmbientLight(0xffffff, 0.5);
    // scene.add(ambience);

    // const point = new THREE.PointLight(0xffffff, 2.0, 1200);
    // scene.add(point);

    // const direct = new THREE.DirectionalLight(0xffffff, 1.0, 100);
    // direct.target = this.mesh;
    // scene.add(direct);

    // const spot = new THREE.SpotLight(0xffffff, 2.0, 1200);
    // spot.target = this.mesh;
    // scene.add(spot);

    // const hemispere = new THREE.HemisphereLight(0xffffbb, 0x8080dd, 2.0);
    // scene.add(hemispere);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const light = new THREE.SpotLight(0xffffff, 1.0, 4000, undefined, 0.06125);
    light.position.y = 100;
    light.position.z = 150;
    light.target = sphereMesh;

    light.castShadow = true;
    light.shadow.bias = 0.0001;
    light.shadow.mapSize.width = 2048 * 2;
    light.shadow.mapSize.height = 2048 * 2;

    scene.add(light);

    this.mesh.castShadow = true;
    sphereMesh.castShadow = true;
    planeMesh.receiveShadow = true;

    this.light = light;

    camera.position.z = 600;

    this.render();
  }

  update() {
    this.delta += 0.01;

    this.camera.position.x = Math.sin(this.delta) * 400;
    this.camera.position.z = Math.cos(this.delta) * 600;
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
