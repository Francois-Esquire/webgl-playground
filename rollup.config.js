import buble from "rollup-plugin-buble";
import glsl from "rollup-plugin-glslify";
import json from "rollup-plugin-json";
import ts from "rollup-plugin-typescript";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

import typescript from "typescript";

import xp from "./src/xp.json";

const plugins = {
  resolve: resolve({
    extensions: [".js", ".jsx", ".json"]
  }),
  cjs: commonjs({
    include: "node_modules/**",
    namedExports: {
      react: [
        "Component",
        "PureComponent",
        "Fragment",
        "Children",
        "createElement"
      ],
      "react-dom": ["render", "hydrate"]
    }
  }),
  buble: buble({
    transforms: {
      // classes: false,
      forOf: false
    },
    objectAssign: "Object.assign",
    jsx: "React.createElement"
  }),
  json: json(),
  glsl: glsl({
    // include: "src/**/*.glsl"
  }),
  ts: ts({
    typescript
  })
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

const server = {
  external: ["fs", "stream", "react", "react-dom/server", "express"],
  input: "src/server/index.js",
  output: { format: "cjs", file: "app.js" },
  plugins: [plugins.resolve, plugins.json, plugins.buble]
};

const programs = [
  ...xp.experiments.map(x => ({
    input: x.src,
    output: {
      format: "iife",
      file: x.file,
      intro: "window.THREE = {};"
    },
    plugins: [plugins.cjs, plugins.resolve, plugins.glsl, plugins.ts]
  }))
];

export default [...programs, server, gl];
