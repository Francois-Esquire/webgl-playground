import buble from "rollup-plugin-buble";
import glsl from "rollup-plugin-glsl";

const plugins = {
  buble: buble({
    transforms: {
      forOf: false,
    },
    objectAssign: 'Object.assign',
  }),
  glsl: glsl({
    include: "src/**/*.glsl",
  }),
};

const triangles = {
  input: "src/triangle/index.js",
  output: { format: "iife", file: "public/app.js", name: "triangles" },
  plugins: [plugins.glsl],
};

const gl = {
  input: "lib/index.js",
  output: [
    { format: "umd", file: "dist/gl.umd.js", name: "gl" },
    { format: "cjs", file: "dist/gl.js", name: "gl" },
    { format: "es", file: "dist/gl.es.js", name: "gl" },
  ],
  // plugins: [plugins.buble],
};

export default [gl, triangles];
