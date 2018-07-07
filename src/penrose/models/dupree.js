import THREE from "three";

export default class Dupree {
  static PLAYER_MOVE = "player.move";

  constructor() {
    // load mesh, textures, material, animation, and audio.
    // make sure to subdivide mesh for things like hair, skin, cloth.
    // assign material appropriately.

    // create mixer for animation
    // track animation and play sound on start.
    // scale player if necessary.
    // place animation track along path.
    this.mixer = new THREE.AnimationMixer /* mesh */();
    this.animations = [];

    // find sounds for animation and have them trigger.
    this.listener = new THREE.AudioListener();
    this.sound = new THREE.Audio(this.listener);
    // audio buffers,
    // pass in as sounds.buffer(trackBuffer);
    this.tracks = [];
  }
}
