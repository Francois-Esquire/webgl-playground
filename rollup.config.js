import glsl from "rollup-plugin-glsl";

const plugins = {
  glsl: glsl({
    include: "src/**/*.glsl"
  })
};

const triangles = {
  input: "src/triangle/index.js",
  output: { format: "iife", file: "public/app.js", name: "triangles" },
  plugins: [plugins.glsl]
};

export default [triangles];
