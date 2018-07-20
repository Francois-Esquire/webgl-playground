/**
 * @author alteredq / http://alteredqualia.com/
 */

import { RGBFormat, FloatType } from "three/src/constants";
import { OrthographicCamera } from "three/src/cameras/OrthographicCamera";
import { ShaderMaterial } from "three/src/materials/ShaderMaterial";
import { PlaneBufferGeometry } from "three/src/geometries/PlaneGeometry";
import { Mesh } from "three/src/objects/Mesh";
import { Scene } from "three/src/scenes/Scene";
import { UniformsUtils } from "three/src/renderers/shaders/UniformsUtils";
import { DataTexture } from "three/src/textures/DataTexture";
import { _Math } from "three/src/math/Math";

import { Pass } from "./Pass";
import { DigitalGlitch } from "../shaders/DigitalGlitch";

class GlitchPass extends Pass {
  constructor(dt_size) {
    super();

    if (DigitalGlitch === undefined)
      console.error("THREE.GlitchPass relies on THREE.DigitalGlitch");

    var shader = DigitalGlitch;
    this.uniforms = UniformsUtils.clone(shader.uniforms);

    if (dt_size == undefined) dt_size = 64;

    this.uniforms["tDisp"].value = this.generateHeightmap(dt_size);

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    });

    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new Scene();

    this.quad = new Mesh(new PlaneBufferGeometry(2, 2), null);
    this.quad.frustumCulled = false; // Avoid getting clipped
    this.scene.add(this.quad);

    this.goWild = false;
    this.curF = 0;
    this.generateTrigger();
  }

  render(renderer, writeBuffer, readBuffer, delta, maskActive) {
    this.uniforms["tDiffuse"].value = readBuffer.texture;
    this.uniforms["seed"].value = Math.random(); //default seeding
    this.uniforms["byp"].value = 0;

    if (this.curF % this.randX == 0 || this.goWild == true) {
      this.uniforms["amount"].value = Math.random() / 30;
      this.uniforms["angle"].value = _Math.randFloat(-Math.PI, Math.PI);
      this.uniforms["seed_x"].value = _Math.randFloat(-1, 1);
      this.uniforms["seed_y"].value = _Math.randFloat(-1, 1);
      this.uniforms["distortion_x"].value = _Math.randFloat(0, 1);
      this.uniforms["distortion_y"].value = _Math.randFloat(0, 1);
      this.curF = 0;
      this.generateTrigger();
    } else if (this.curF % this.randX < this.randX / 5) {
      this.uniforms["amount"].value = Math.random() / 90;
      this.uniforms["angle"].value = _Math.randFloat(-Math.PI, Math.PI);
      this.uniforms["distortion_x"].value = _Math.randFloat(0, 1);
      this.uniforms["distortion_y"].value = _Math.randFloat(0, 1);
      this.uniforms["seed_x"].value = _Math.randFloat(-0.3, 0.3);
      this.uniforms["seed_y"].value = _Math.randFloat(-0.3, 0.3);
    } else if (this.goWild == false) {
      this.uniforms["byp"].value = 1;
    }

    this.curF++;
    this.quad.material = this.material;

    if (this.renderToScreen) {
      renderer.render(this.scene, this.camera);
    } else {
      renderer.render(this.scene, this.camera, writeBuffer, this.clear);
    }
  }

  generateTrigger() {
    this.randX = _Math.randInt(120, 240);
  }

  generateHeightmap(dt_size) {
    var data_arr = new Float32Array(dt_size * dt_size * 3);
    var length = dt_size * dt_size;

    for (var i = 0; i < length; i++) {
      var val = _Math.randFloat(0, 1);
      data_arr[i * 3 + 0] = val;
      data_arr[i * 3 + 1] = val;
      data_arr[i * 3 + 2] = val;
    }

    var texture = new DataTexture(
      data_arr,
      dt_size,
      dt_size,
      RGBFormat,
      FloatType
    );
    texture.needsUpdate = true;
    return texture;
  }
}

export { GlitchPass };
