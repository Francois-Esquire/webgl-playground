import vertexShaderSource from "./shaders/vertex.home.glsl";
import fragmentShaderSource from "./shaders/fragment.home.glsl";

document.addEventListener("DOMContentLoaded", main);

function main() {
  const canvas = document.createElement("canvas");

  let gl =
    canvas.getContext("webgl2") ||
    canvas.getContext("webgl") ||
    canvas.getContext("experimental-webgl");

  if (
    gl &&
    (gl instanceof WebGL2RenderingContext ||
      gl instanceof WebGLRenderingContext)
  ) {
    canvas.style =
      "position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: -5;";

    document.body.appendChild(canvas);

    resize();

    init(gl, canvas);

    window.addEventListener("resize", resize);

    function resize() {
      const dpr = window.devicePixelRatio;

      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      // gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
  } else {
    console.log(
      "Failed to get WebGL context. " +
        "Your browser or device may not support WebGL."
    );
  }
}

function init(gl) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader));
    return null;
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader));
    return null;
  }

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) === false) {
    alert("Could Not Link Shaders");

    gl.deleteShader(shaderProgram);
    return null;
  }

  gl.useProgram(shaderProgram);

  // ATTRIBUTES
  const triangleVertices = new Float32Array([
    1.0,
    -1.0,
    0.5,
    0.5,
    1.0,
    0.6,
    -0.2,
    -0.0,
    0.0
  ]);
  const triangleVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);
  const positionAttributeLocation = gl.getAttribLocation(
    shaderProgram,
    "position"
  );
  gl.enableVertexAttribArray(positionAttributeLocation);
  // gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  // UNIFORMS
  var timeClock = gl.getUniformLocation(shaderProgram, "u_clock");

  render();

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clearColor(0.5, 1, 0.5, 1);

    gl.uniform1f(timeClock, Date.now());

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(render);
  }
}
