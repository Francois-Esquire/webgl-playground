(function () {
  'use strict';

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

  var fragmentShaderSource = "#version 300 es\nprecision mediump float;in vec4 fcolor;out vec4 finalColor;void main(){finalColor=fcolor;}";

  var vertexShaderSource = "#version 300 es\nin vec3 position;in vec4 color;out vec4 fcolor;void main(){gl_Position=vec4(position,1);fcolor=color;}";

  let gl$1;

  (function start(config) {
    // TODO:
    // check compatability / support.

    document.addEventListener("DOMContentLoaded", function loaded() {
      const canvas = document.getElementById('c');

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      window.addEventListener("resize", function onresize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if (gl$1) gl$1.viewport(0, 0, canvas.width, canvas.height);
      });

      gl$1 = canvas.getContext('webgl2');

      if (config.lib) lib();
      else triangle();
    });
  })({ lib: true });

  function lib() {
    const egl = new Engine(gl$1);

    const {
      FLOAT,
      STATIC_DRAW,
      ARRAY_BUFFER,
      VERTEX_SHADER,
      FRAGMENT_SHADER,
    } = gl$1;

    let vec_01 = new Vector(  1.0, -1.0, 0.0 );
    let vec_02 = new Vector(  0.0,  1.0, 0.0 );
    let vec_03 = new Vector( -1.0, -1.0, 0.0 );

    let color_01 = new Vector( 1.0, 0.0, 0.0, 1.0 );
    let color_02 = new Vector( 0.0, 1.0, 0.0, 1.0 );
    let color_03 = new Vector( 0.0, 0.0, 1.0, 1.0 );

    const vertices = new Float32Array([...vec_01, ...vec_02, ...vec_03]);

    const colors = new Float32Array([...color_01, ...color_02, ...color_03]);

    const triangleVerticesBuffer = egl.createBuffer(ARRAY_BUFFER,  vertices, STATIC_DRAW);

    const triangleColorsBuffer = egl.createBuffer(ARRAY_BUFFER,  colors, STATIC_DRAW);

    const vertexShader = egl.createShader(VERTEX_SHADER, vertexShaderSource);

    const fragmentShader = egl.createShader(FRAGMENT_SHADER, fragmentShaderSource);

    const shaderProgram = egl.createProgram(vertexShader, fragmentShader);

    egl.createAttribute(shaderProgram, ARRAY_BUFFER, triangleVerticesBuffer, "position", 3, FLOAT);
    egl.createAttribute(shaderProgram, ARRAY_BUFFER, triangleColorsBuffer, "color", 4, FLOAT);

    egl.run();
  }

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

    const triangleVerticesBuffer = gl$1.createBuffer();
    const triangleColorsBuffer = gl$1.createBuffer();

    // static draw tells the gpu that the input data is not expected to change.
    gl$1.bindBuffer(gl$1.ARRAY_BUFFER, triangleVerticesBuffer);
    gl$1.bufferData(gl$1.ARRAY_BUFFER, triangleVertices, gl$1.STATIC_DRAW);

    // rebind by assigning to color data.
    gl$1.bindBuffer(gl$1.ARRAY_BUFFER, triangleColorsBuffer);
    gl$1.bufferData(gl$1.ARRAY_BUFFER, triangleColors, gl$1.STATIC_DRAW);

    const vertexShader = createShader(vertexShaderSource, gl$1.VERTEX_SHADER);

    const fragmentShader = createShader(fragmentShaderSource, gl$1.FRAGMENT_SHADER);

    const shaderProgram = gl$1.createProgram();

    gl$1.attachShader(shaderProgram, vertexShader);
    gl$1.attachShader(shaderProgram, fragmentShader);

    gl$1.linkProgram(shaderProgram);

    if (gl$1.getProgramParameter(shaderProgram, gl$1.LINK_STATUS) === false) {
      alert("Could Not Link Shaders");
    }

    // this can be called with other shader programs within the same context.
    gl$1.useProgram(shaderProgram);

    // point buffer to memory index
    const positionAttributeLocation = createAttributeLocation(
      shaderProgram,
      "position"
    );
    gl$1.bindBuffer(gl$1.ARRAY_BUFFER, triangleVerticesBuffer);
    // gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
    gl$1.vertexAttribPointer(positionAttributeLocation, 3, gl$1.FLOAT, false, 0, 0);

    const colorAttributeLocation = createAttributeLocation(
      shaderProgram,
      "color"
    );
    gl$1.bindBuffer(gl$1.ARRAY_BUFFER, triangleColorsBuffer);
    gl$1.vertexAttribPointer(colorAttributeLocation, 4, gl$1.FLOAT, false, 0, 0);

    runRenderLoop();
  }

  function runRenderLoop() {
    gl$1.clearColor(0, 0, 0, 1);
    gl$1.clear(gl$1.COLOR_BUFFER_BIT);

    gl$1.drawArrays(gl$1.TRIANGLES, 0, 3);

    requestAnimationFrame(runRenderLoop);
  }

  function createAttributeLocation(program, variable, data) {
    // point buffer to memory index
    const attributeLocation = gl$1.getAttribLocation(program, variable);

    gl$1.enableVertexAttribArray(attributeLocation);

    return attributeLocation;
  }

  function createShader(shaderSource, shaderType) {
    const shader = gl$1.createShader(shaderType);

    gl$1.shaderSource(shader, shaderSource);
    gl$1.compileShader(shader);

    const status = gl$1.getShaderParameter(shader, gl$1.COMPILE_STATUS);

    if (!status) {
      alert(gl$1.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }

}());
