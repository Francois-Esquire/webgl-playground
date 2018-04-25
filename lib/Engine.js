import Matrix from './Matrix';
import Vector from './Vector';

export let gl;

export default class Engine {
  constructor(ctx) {
    gl = ctx;

    this.run = this.run.bind(this);
  }

  get viewport() {
    return gl.getParameter(gl.VIEWPORT);
  }

  get maxViewportDimensions() {
    return gl.getParameter(gl.MAX_VIEWPORT_DIMS);
  }

  run() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(this.run);
  }

  createBuffer(type, data, usage) {
    const buffer = gl.createBuffer();

    console.log(buffer);

    gl.bindBuffer(type, buffer);

    gl.bufferData(type, data, usage || gl.STATIC_DRAW);

    return buffer;
  }

  createAttribute(program, bufferType, buffer, variable, size, type = gl.FLOAT, normalized = false, stride = 0, offset = 0) {
    const attributeLocation = gl.getAttribLocation(program, variable);

    gl.enableVertexAttribArray(attributeLocation);

    gl.bindBuffer(bufferType, buffer);

    // gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
    gl.vertexAttribPointer(attributeLocation, size, type, normalized, stride, offset);

    return attributeLocation;
  }

  createShader(type, source) {
    var shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (success) return shader;

    const info = gl.getShaderInfoLog(shader);

    console.warn(info);

    gl.deleteShader(shader);

    return null;
  }

  createProgram(vertexShader, fragmentShader) {
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);

    gl.attachShader(program, fragmentShader);

    return this.linkProgram(program);
  }

  linkProgram(program) {
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (success) {
      gl.useProgram(program);

      return program;
    }

    const info = gl.getProgramInfoLog(program);

    console.warn(info);

    gl.deleteProgram(program);

    return null;
  }
}
