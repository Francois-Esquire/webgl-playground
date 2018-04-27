import buble from "rollup-plugin-buble";
import glsl from "rollup-plugin-glsl";

const plugins = {
  buble: buble({
    transforms: {
      classes: false,
      forOf: false,
    },
    objectAssign: 'Object.assign',
  }),
  glsl: glsl({
    include: "src/**/*.glsl",
  }),
};

const triangles = {
  input: "src/index.js",
  output: { format: "iife", file: "public/program.js" },
  plugins: [plugins.glsl],
};

const gl = {
  input: "lib/index.js",
  output: [
    { format: "umd", file: "dist/gl.umd.js", name: 'gl' },
    { format: "cjs", file: "dist/gl.js" },
    { format: "es", file: "dist/gl.es.js" },
  ],
  plugins: [plugins.buble],
};

export default [gl, triangles];
