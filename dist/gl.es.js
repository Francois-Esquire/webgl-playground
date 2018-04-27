class Matrix {}

const _instances = new WeakSet();

class Vector {
  constructor(...args) {
    this.translate(...args);

    _instances.add(this);
  }

  clone() {
    return new Vector(...this);
  }

  translate(...args) {
    const { x, y, z, w } = Vector.input(...args);

    if (x) this.x = x;
    if (y) this.y = y;
    if (z) this.z = z;
    if (w) this.w = w;

    return this;
  }

  invert() {
    for (let point of this.keys) {
      // ehhh...
      this[point] = this[point] *= -1;
    }

    return this;
  }

  get axis() {
    const { x, y, z, w } = this;

    const points = Object.create(null);

    return Object.assign(points, { x, y, z, w });
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
        const { x, y, z, w } = points;

        return [x, y].concat(z || (w ? undefined : []), w || []);
      })(this),
      next() {
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
}

// STATICS:
Object.defineProperties(Vector, {
  [Symbol.hasInstance]: {
    value(instance) {
      return _instances.has(instance);
    },
  },
  [Symbol.toStringTag]: {
    get() {
      // TODO:
      // will always be Vector4, counts formal arguments.
      return `Vector${this.length}`;
    },
  },
  create:{
    value: function create(vector) {
      return vector instanceof Vector ? vector.clone() : new Vector(vector);
    },
  },
  remove: {
    value: function remove(ref) {
      _instances.delete(ref);
    },
  },
  purge: {
    value: function purge() {
      // useful? maybe with Set.
      // deprecated...
      _instances.clear();
    },
  },
  input: {
    value: function input(...args) {
      const transform = args.length > 1 ? args : args[0] || {};

      let { x, y, z, w } = transform instanceof Array ?
        transform.reduce((map, t, i) => {

          Object.assign(map, {
            [String.fromCharCode(119 + (i === 3 ? 0 : i + 1))]: t,
          });

          return map;
        }, {}) :
        transform;

      x = typeof x === 'number' ? x.toFixed() : 0.0;
      y = typeof y === 'number' ? y.toFixed() : 0.0;
      if (typeof z === 'number') z = z.toFixed();
      if (typeof w === 'number') w = w.toFixed();

      return Object.assign(Object.create(null), { x, y, z, w });
    }
  }
});

let gl;

class Engine {
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

export { Matrix, Vector, Engine, gl };
