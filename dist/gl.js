'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class Matrix {}

var obj;
var _instances = new WeakSet();

class Vector {
  constructor() {
  var ref;

  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];
    (ref = this).translate.apply(ref, args);

    _instances.add(this);
  }

  clone() {
    return new (Function.prototype.bind.apply( Vector, [ null ].concat( this) ));
  }

  translate() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var ref = Vector.input.apply(Vector, args);
    var x = ref.x;
    var y = ref.y;
    var z = ref.z;
    var w = ref.w;

    if (x) { this.x = x; }
    if (y) { this.y = y; }
    if (z) { this.z = z; }
    if (w) { this.w = w; }

    return this;
  }

  invert() {
    var this$1 = this;

    for (var point of this$1.keys) {
      // ehhh...
      this$1[point] = this$1[point] *= -1;
    }

    return this;
  }

  get axis() {
    var ref = this;
    var x = ref.x;
    var y = ref.y;
    var z = ref.z;
    var w = ref.w;

    var points = Object.create(null);

    return Object.assign(points, { x: x, y: y, z: z, w: w });
  }

  get keys() {
    return Object.keys(this);
  }

  get array() {
    return Array.from(this);
  }

  get length() {
    return this.array.length;
  }

  [Symbol.iterator]() {
    return {
      points: (function _toArray(points) {
        var x = points.x;
        var y = points.y;
        var z = points.z;
        var w = points.w;

        return [x, y].concat(z || (w ? undefined : []), w || []);
      })(this),
      next: function next() {
        return { done: this.points.length === 0, value: this.points.shift() };
      },
    };
  }

  [Symbol.toPrimitive](hint) {
    switch (hint) {
      default:
        throw new Error();
      case 'default':
        // return this;
      case 'number':
        return this.length;
      case 'string':
        return JSON.stringify(this.axis);
    }
  }

  static create(vector) {
    return vector instanceof Vector ? vector.clone() : new Vector(vector);
  }
}

// STATICS:
Object.defineProperties(Vector, ( obj = {}, obj[Symbol.hasInstance] = {
    value: function value(instance) {
      return _instances.has(instance);
    },
  }, obj[Symbol.toStringTag] = {
    get: function get() {
      // TODO:
      // fix - will always be Vector4, counts formal arguments.
      return ("Vector" + (this.length));
    },
  }, obj.create = {
    value: function create(vector) {
      return vector instanceof Vector ? vector.clone() : new Vector(vector);
    },
  }, obj.remove = {
    value: function remove(ref) {
      _instances.delete(ref);
    },
  }, obj.input = {
    value: function input() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var transform = args.length > 1 ? args : args[0] || {};

      var ref = transform instanceof Array ?
        transform.reduce(function (map, t, i) {
          var obj;

          Object.assign(map, ( obj = {}, obj[String.fromCharCode(119 + (i === 3 ? 0 : i + 1))] = t, obj ));

          return map;
        }, {}) :
        transform;
      var x = ref.x;
      var y = ref.y;
      var z = ref.z;
      var w = ref.w;

      x = typeof x === 'number' ? x.toFixed() : 0.0;
      y = typeof y === 'number' ? y.toFixed() : 0.0;
      if (typeof z === 'number') { z = z.toFixed(); }
      if (typeof w === 'number') { w = w.toFixed(); }

      return Object.assign(Object.create(null), { x: x, y: y, z: z, w: w });
    }
  }, obj ));

class Engine {
  constructor(ctx) {
    exports.gl = ctx;

    this.run = this.run.bind(this);
  }

  get viewport() {
    return exports.gl.getParameter(exports.gl.VIEWPORT);
  }

  get maxViewportDimensions() {
    return exports.gl.getParameter(exports.gl.MAX_VIEWPORT_DIMS);
  }

  run() {
    exports.gl.clearColor(0, 0, 0, 1);
    exports.gl.clear(exports.gl.COLOR_BUFFER_BIT);

    exports.gl.drawArrays(exports.gl.TRIANGLES, 0, 3);

    requestAnimationFrame(this.run);
  }

  createBuffer(type, data, usage) {
    var buffer = exports.gl.createBuffer();

    console.log(buffer);

    exports.gl.bindBuffer(type, buffer);

    exports.gl.bufferData(type, data, usage || exports.gl.STATIC_DRAW);

    return buffer;
  }

  createAttribute(program, bufferType, buffer, variable, size, type, normalized, stride, offset) {
    if ( type === void 0 ) type = exports.gl.FLOAT;
    if ( normalized === void 0 ) normalized = false;
    if ( stride === void 0 ) stride = 0;
    if ( offset === void 0 ) offset = 0;

    var attributeLocation = exports.gl.getAttribLocation(program, variable);

    exports.gl.enableVertexAttribArray(attributeLocation);

    exports.gl.bindBuffer(bufferType, buffer);

    // gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
    exports.gl.vertexAttribPointer(attributeLocation, size, type, normalized, stride, offset);

    return attributeLocation;
  }

  createShader(type, source) {
    var shader = exports.gl.createShader(type);

    exports.gl.shaderSource(shader, source);
    exports.gl.compileShader(shader);

    var success = exports.gl.getShaderParameter(shader, exports.gl.COMPILE_STATUS);

    if (success) { return shader; }

    var info = exports.gl.getShaderInfoLog(shader);

    console.warn(info);

    exports.gl.deleteShader(shader);

    return null;
  }

  createProgram(vertexShader, fragmentShader) {
    var program = exports.gl.createProgram();

    exports.gl.attachShader(program, vertexShader);

    exports.gl.attachShader(program, fragmentShader);

    return this.linkProgram(program);
  }

  linkProgram(program) {
    exports.gl.linkProgram(program);

    var success = exports.gl.getProgramParameter(program, exports.gl.LINK_STATUS);

    if (success) {
      exports.gl.useProgram(program);

      return program;
    }

    var info = exports.gl.getProgramInfoLog(program);

    console.warn(info);

    exports.gl.deleteProgram(program);

    return null;
  }
}

exports.Matrix = Matrix;
exports.Vector = Vector;
exports.Engine = Engine;
