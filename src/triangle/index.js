import fragmentShaderSource from "./fragment.glsl";
import vertexShaderSource from "./vertex.glsl";

let gl;

document.addEventListener("DOMContentLoaded", function loaded() {
  const canvas = document.getElementById("c");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener("resize", function onresize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  gl = canvas.getContext("webgl2");

  triangle();
});

function triangle() {
  const triangleVertices = new Float32Array([
    1.0,
    -1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    -1.0,
    -1.0,
    0.0
  ]);

  const triangleColors = new Float32Array([
    1.0,
    0.0,
    0.0,
    1.0,
    0.0,
    1.0,
    0.0,
    1.0,
    0.0,
    0.0,
    1.0,
    1.0
  ]);

  const triangleVerticesBuffer = gl.createBuffer();
  const triangleColorsBuffer = gl.createBuffer();

  // static draw tells the gpu that the input data will not change.
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);

  // rebind by assigning to color data.
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, triangleColors, gl.STATIC_DRAW);

  const vertexShader = createShader(vertexShaderSource, gl.VERTEX_SHADER);

  const fragmentShader = createShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

  const shaderProgram = gl.createProgram();

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);

  gl.linkProgram(shaderProgram);

  if (gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) === false) {
    alert("Could Not Link Shaders");
  }

  // this can be called with other shader programs within the same context.
  gl.useProgram(shaderProgram);

  // point buffer to memory index
  const positionAttributeLocation = createAttributeLocation(
    shaderProgram,
    "position"
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerticesBuffer);
  // gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  const colorAttributeLocation = createAttributeLocation(
    shaderProgram,
    "color"
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorsBuffer);
  gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

  runRenderLoop();
}

function runRenderLoop() {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, 3);

  requestAnimationFrame(runRenderLoop);
}

function createAttributeLocation(program, variable, data) {
  // point buffer to memory index
  const attributeLocation = gl.getAttribLocation(program, variable);

  gl.enableVertexAttribArray(attributeLocation);

  return attributeLocation;
}

function createShader(shaderSource, shaderType) {
  const shader = gl.createShader(shaderType);

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (!status) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}
