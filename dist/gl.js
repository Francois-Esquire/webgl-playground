var Matrix = function Matrix () {};

var obj;
var _instances = new WeakSet();

var Vector = function Vector(x, y, z, w) {
  this.x = x.toFixed() || 0.0;
  this.y = y.toFixed() || 0.0;
  if (isNaN(z) === false) { this.z = z.toFixed(); }
  if (isNaN(w) === false) { this.w = w.toFixed(); }

  _instances.add(this);
};

var prototypeAccessors = { keys: { configurable: true },array: { configurable: true },length: { configurable: true } };

Vector.prototype.clone = function clone () {
  return new (Function.prototype.bind.apply( Vector, [ null ].concat( this) ));
};

Vector.prototype.translate = function translate (transform) {
  var x = transform.x;
    var y = transform.y;
    var z = transform.z;
    var w = transform.w;

  if (x) { this.x = x.toFixed(); }
  if (y) { this.y = y.toFixed(); }
  if (z) { this.z = z.toFixed(); }
  if (w) { this.w = w.toFixed(); }

  return this;
};

Vector.prototype.invert = function invert () {
    var this$1 = this;

  for (var point of this$1.keys) {
    this$1[point] = this$1[point] *= -1;
  }

  return this;
};

// recursive calling going on...
// this would work better with all four keys on a proxy.
// explore a more suitable expression around this idea.
// set w(value) {
// const { keys, array } = this;
//
// if (array.includes(undefined)) {
//   // find the first undefined value nad assign to it.
//   this[keys[array.indexOf(undefined)]] = value;
// } else this.w = value;
//
// return value;
// }

prototypeAccessors.keys.get = function () {
  return Object.keys(this);
};

prototypeAccessors.array.get = function () {
  return Array.from(this);
};

prototypeAccessors.length.get = function () {
  return this.array.length;
};

Vector.prototype[Symbol.iterator] = function () {
  return {
    points: (function _toArray(points) {
      var x = points.x;
        var y = points.y;
        var z = points.z;
        var w = points.w;

      return [x, y].concat(z || [], w || []);
    })(this),
    next: function next() {
      return { done: this.points.length === 0, value: this.points.shift() };
    },
  };
};

Vector.prototype[Symbol.toPrimitive] = function (hint) {
  switch (hint) {
    default:
      throw new Error();
    case 'default':
      // return this;
    case 'number':
      return this.length;
    case 'string':
      return JSON.stringify(this);
  }
};

Object.defineProperties( Vector.prototype, prototypeAccessors );

Object.defineProperties(Vector, ( obj = {}, obj[Symbol.hasInstance] = {
    value: function value(instance) {
      return _instances.has(instance);
    },
  }, obj[Symbol.toStringTag] = {
    get: function get() {
      // will always be Vector4, counts formal arguments.
      return ("Vector" + (this.length));
    },
  }, obj ));

var gl;

var Engine = function Engine(ctx) {
  gl = ctx;

  this.run = this.run.bind(this);
};

var prototypeAccessors$1 = { viewport: { configurable: true },maxViewportDimensions: { configurable: true } };

prototypeAccessors$1.viewport.get = function () {
  return gl.getParameter(gl.VIEWPORT);
};

prototypeAccessors$1.maxViewportDimensions.get = function () {
  return gl.getParameter(gl.MAX_VIEWPORT_DIMS);
};

Engine.prototype.run = function run () {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, 3);

  requestAnimationFrame(this.run);
};

Engine.prototype.createBuffer = function createBuffer (type, data, usage) {
  var buffer = gl.createBuffer();

  console.log(buffer);

  gl.bindBuffer(type, buffer);

  gl.bufferData(type, data, usage || gl.STATIC_DRAW);

  return buffer;
};

Engine.prototype.createAttribute = function createAttribute (program, bufferType, buffer, variable, size, type, normalized, stride, offset) {
    if ( type === void 0 ) type = gl.FLOAT;
    if ( normalized === void 0 ) normalized = false;
    if ( stride === void 0 ) stride = 0;
    if ( offset === void 0 ) offset = 0;

  var attributeLocation = gl.getAttribLocation(program, variable);

  gl.enableVertexAttribArray(attributeLocation);

  gl.bindBuffer(bufferType, buffer);

  // gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
  gl.vertexAttribPointer(attributeLocation, size, type, normalized, stride, offset);

  return attributeLocation;
};

Engine.prototype.createShader = function createShader (type, source) {
  var shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (success) { return shader; }

  var info = gl.getShaderInfoLog(shader);

  console.warn(info);

  gl.deleteShader(shader);

  return null;
};

Engine.prototype.createProgram = function createProgram (vertexShader, fragmentShader) {
  var program = gl.createProgram();

  gl.attachShader(program, vertexShader);

  gl.attachShader(program, fragmentShader);

  return this.linkProgram(program);
};

Engine.prototype.linkProgram = function linkProgram (program) {
  gl.linkProgram(program);

  var success = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (success) {
    gl.useProgram(program);

    return program;
  }

  var info = gl.getProgramInfoLog(program);

  console.warn(info);

  gl.deleteProgram(program);

  return null;
};

Object.defineProperties( Engine.prototype, prototypeAccessors$1 );

export { Matrix, Vector, Engine };
