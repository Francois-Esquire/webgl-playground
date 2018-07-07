import Program from "./Program";

import Penrose from "./scenes/Penrose";

const scenes = [Penrose];

const options = {
  audio: true,
  first: "Penrose"
};

// TODO:
// check for webgl

window.program = new Program(scenes, options);
