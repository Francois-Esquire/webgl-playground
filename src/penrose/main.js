import THREE from "three";

const canvas = document.getElementById("c");

class Penrose {
  constructor() {
    this.render = this.render.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    window.addEventListener("resize", this.onWindowResize);
    document.addEventListener("keydown", this.onKeyDown);

    // check for webgl before this
    this.start();
  }

  start() {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

    this.renderer.setClearColor(0x0c0c0c);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.physicallyCorrectLights = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.scene = new THREE.Scene();

    const ratio = window.innerWidth / window.innerHeight;
    const d = 100;
    const p = 20;

    this.camera = new THREE.OrthographicCamera(
      -d * ratio,
      d * ratio,
      d,
      -d,
      1,
      1000
    );

    this.camera.aspect = ratio;
    this.camera.position.set(p, p, p);
    this.camera.lookAt(this.scene.position);

    this.generateScene();
    this.render();
  }

  render() {
    requestAnimationFrame(this.render);

    this.update();

    this.renderer.render(this.scene, this.camera);
  }

  update() {
    //
  }

  generateScene() {
    const { scene } = this;
    // create geometry for penrose staircase.
    // add ball which accepts input and reacts to user keydown.
    // constrain ball to staircase.
    const ambience = new THREE.AmbientLight(0x0f0f0f, 1.5);

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

    this.player = this.createPlayer();
    this.createStaircase();
  }

  createPlayer() {
    return this.createSphere();
  }

  createStaircase() {
    const { scene } = this;

    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const slab = new THREE.BoxBufferGeometry(10, 0.51, 10);

    for (let i = 0; i <= 7; i++) {
      const x = 10 - 7 * i;
      const y = 10 - 5 * i;
      const z = 10 + 5 * i;

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

    const cube = new THREE.BoxBufferGeometry(10, 1, 10);
    const cubeMesh = new THREE.Mesh(cube, material);

    cubeMesh.castShadow = true;
    cubeMesh.receiveShadow = true;

    cubeMesh.position.set(5, -6, -5);

    scene.add(cubeMesh);
  }

  createSphere() {
    const { scene } = this;

    const sphere = new THREE.SphereGeometry(5, 100, 100);

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xff3322,
      roughness: 0.75,
      metalness: 0.0625,
      clearCoat: 0.27
    });

    const mesh = new THREE.Mesh(sphere, material);

    mesh.position.set(-10, 1, 1);

    scene.add(mesh);

    return mesh;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onKeyDown(event) {
    const { keyCode } = event;
    console.log(keyCode);

    switch (keyCode) {
      default:
        break;
      case 37:
        this.player.position.z += 1;
        break;
      case 38:
        this.player.position.x -= 1;
        break;
      case 39:
        this.player.position.z -= 1;
        break;
      case 40:
        this.player.position.x += 1;
        break;
    }
  }
}

window.Penrose = new Penrose();
