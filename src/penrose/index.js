// import "./main";

import Program from "./Program";

import Penrose from "./scenes/Penrose";

const scenes = [Penrose];

const options = {
  audio: true,
  first: "Penrose"
};

window.program = new Program(scenes, options);
