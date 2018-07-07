import buble from "rollup-plugin-buble";
import glsl from "rollup-plugin-glsl";
import ts from "rollup-plugin-typescript";

import typescript from "typescript";

const plugins = {
  buble: buble({
    transforms: {
      classes: false,
      forOf: false
    },
    objectAssign: "Object.assign"
  }),
  glsl: glsl({
    include: "src/**/*.glsl"
  }),
  ts: ts({
    typescript
  })
};

const program = {
  input: "src/program.js",
  external: ["three"],
  output: {
    format: "iife",
    file: "public/program.js",
    interop: false,
    globals: {
      three: "THREE"
    }
  },
  plugins: [plugins.glsl]
};

const gl = {
  input: "lib/index.ts",
  output: [
    { format: "umd", file: "dist/gl.umd.js", name: "gl" },
    { format: "cjs", file: "dist/gl.js" },
    { format: "es", file: "dist/gl.es.js" }
  ],
  plugins: [plugins.ts, plugins.buble]
};

export default [gl, program];
