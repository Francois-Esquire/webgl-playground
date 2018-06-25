import THREE from "three";

const canvas = document.getElementById("c");

class Penrose {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      canvas,

      antialias: true
    });

    this.renderer.setClearColor(0x0c0c0c);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    const d = 50;

    this.camera = new THREE.OrthographicCamera(
      -d * aspect,
      d * aspect,
      d,
      -d,
      1,
      1000
    );

    this.camera.position.set(20, 20, 20);
    this.camera.lookAt(this.scene.position);

    this.render = this.render.bind(this);

    this.start();
  }

  start() {
    const { renderer } = this;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    this.generateScene();

    return this.render();
  }

  update() {
    //
  }

  render() {
    // this.update();

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.render);
  }

  generateScene() {
    const { scene } = this;
    // create geometry for penrose staircase.
    // add ball which accepts input and reacts to user keydown.
    // constrain ball to staircase.
    const ambience = new THREE.AmbientLight(0xffffff, 0.135);

    scene.add(ambience);

    // const light = new THREE.PointLight(0xffffff, 2.0, 50);
    // light.position.y = 20;
    // light.position.x = 20;

    const light = new THREE.DirectionalLight(0xffffff, 2.0);

    light.position.set(0, 100, 0);

    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    light.shadow.camera.left = -500;
    light.shadow.camera.bottom = -500;
    light.shadow.camera.right = 500;
    light.shadow.camera.top = 500;

    light.target = scene;

    light.castShadow = true;
    light.shadow.bias = 0.000001;
    light.shadow.mapSize = new THREE.Vector2(2048 * 2, 2048 * 2);

    scene.add(light);

    this.createStaircase();
  }

  createStaircase() {
    const { scene } = this;

    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });

    // const cube = new THREE.BoxBufferGeometry(10, 1, 10);
    // const cubeMesh = new THREE.Mesh(cube, material);

    // cubeMesh.position.set(5, -6, -5);

    // scene.add(cubeMesh);

    for (let i = 0; i <= 7; i++) {
      const x = 10 - 7 * i;
      const y = 10 - 3 * i;
      const z = 10 + 5 * i;

      const slab = new THREE.BoxBufferGeometry(10, 0.1, 10);
      const slabMesh = new THREE.Mesh(slab, material);

      slabMesh.position.set(x, y, z);

      slabMesh.castShadow = true;
      slabMesh.receiveShadow = true;

      scene.add(slabMesh);
    }
  }

  createCenterCube() {
    const { scene } = this;

    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });

    const cube = new THREE.BoxBufferGeometry(10, 1, 10, 10, 10, 10);
    const cubeMesh = new THREE.Mesh(cube, material);

    scene.add(cubeMesh);
  }
}

window.Penrose = new Penrose();
