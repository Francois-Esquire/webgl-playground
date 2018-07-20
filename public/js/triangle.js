(function () {
    'use strict';

    window.THREE = {};

    var Vector = /** @class */ (function () {
        function Vector() {
            var arguments$1 = arguments;

            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments$1[_i];
            }
            this.x = 0.0;
            this.y = 0.0;
            var _a = Vector._input.apply(Vector, args), x = _a.x, y = _a.y, z = _a.z, w = _a.w;
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
            Vector._instances.add(this);
        }
        Vector.prototype.clone = function () {
            return new Vector(this);
        };
        Vector.prototype.translate = function () {
            var arguments$1 = arguments;

            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments$1[_i];
            }
            var _a = Vector._input.apply(Vector, args), x = _a.x, y = _a.y, z = _a.z, w = _a.w;
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
            return this;
        };
        Object.defineProperty(Vector.prototype, "length", {
            get: function () {
                return this._array.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector.prototype, "_array", {
            get: function () {
                return Array.from(this);
            },
            enumerable: true,
            configurable: true
        });
        Vector.create = function (vector) {
            return vector instanceof Vector ? vector.clone() : new Vector(vector);
        };
        Vector.delete = function (ref) {
            Vector._instances.delete(ref);
        };
        Vector._input = function () {
            var arguments$1 = arguments;

            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments$1[_i];
            }
            var transform = (args.length > 1 ? args : args[0]) || {};
            var _a = transform instanceof Array
                ? transform.reduce(function (map, t, i) {
                    var _a;
                    Object.assign(map, (_a = {},
                        _a[String.fromCharCode(119 + (i === 3 ? 0 : i + 1))] = t,
                        _a));
                    return map;
                }, {})
                : transform, x = _a.x, y = _a.y, z = _a.z, w = _a.w;
            return Object.assign(Object.create(null), {
                x: x,
                y: y,
                z: z,
                w: w
            });
        };
        Vector.prototype[Symbol.iterator] = function () {
            return {
                points: (function _toArray(vec) {
                    var x = vec.x, y = vec.y, z = vec.z, w = vec.w;
                    return [x, y].concat(typeof z === "number" ? z : typeof w === "number" ? undefined : [], typeof w === "number" ? w : []);
                })(this),
                next: function () {
                    return { done: this.points.length === 0, value: this.points.shift() };
                }
            };
        };
        Vector.prototype[Symbol.toPrimitive] = function (hint) {
            switch (hint) {
                default:
                    throw new Error();
                case "default":
                    return this.length;
            }
        };
        Object.defineProperty(Vector.prototype, Symbol.toStringTag, {
            get: function () {
                return "Vector" + this.length;
            },
            enumerable: true,
            configurable: true
        });
        Vector._instances = new WeakSet();
        return Vector;
    }());

    var gl;
    var Engine = /** @class */ (function () {
        function Engine(ctx) {
            gl = ctx;
            this.run = this.run.bind(this);
        }
        Object.defineProperty(Engine.prototype, "viewport", {
            get: function () {
                return gl.getParameter(gl.VIEWPORT);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Engine.prototype, "maxViewportDimensions", {
            get: function () {
                return gl.getParameter(gl.MAX_VIEWPORT_DIMS);
            },
            enumerable: true,
            configurable: true
        });
        Engine.prototype.run = function () {
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            requestAnimationFrame(this.run);
        };
        Engine.prototype.createBuffer = function (type, data, usage) {
            var buffer = gl.createBuffer();
            gl.bindBuffer(type, buffer);
            gl.bufferData(type, data, usage || gl.STATIC_DRAW);
            return buffer;
        };
        Engine.prototype.createAttribute = function (program, bufferType, buffer, variable, size, type, normalized, stride, offset) {
            if (type === void 0) { type = gl.FLOAT; }
            if (normalized === void 0) { normalized = false; }
            if (stride === void 0) { stride = 0; }
            if (offset === void 0) { offset = 0; }
            var attributeLocation = gl.getAttribLocation(program, variable);
            gl.enableVertexAttribArray(attributeLocation);
            gl.bindBuffer(bufferType, buffer);
            // gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
            gl.vertexAttribPointer(attributeLocation, size, type, normalized, stride, offset);
            return attributeLocation;
        };
        Engine.prototype.createShader = function (type, source) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if (success)
                { return shader; }
            var info = gl.getShaderInfoLog(shader);
            console.warn(info);
            gl.deleteShader(shader);
            return null;
        };
        Engine.prototype.createProgram = function (vertexShader, fragmentShader) {
            var program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            return this.linkProgram(program);
        };
        Engine.prototype.linkProgram = function (program) {
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
        return Engine;
    }());

    var fragmentShaderSource = "#version 300 es\n\nprecision mediump float;\n#define GLSLIFY 1\n\nin vec4 fcolor;\n\nout vec4 finalColor;\n\nvoid main() {\n  finalColor = fcolor;\n}\n"; // eslint-disable-line

    var vertexShaderSource = "#version 300 es\n#define GLSLIFY 1\n\nin vec3 position;\nin vec4 color;\n\nout vec4 fcolor;\n\nvoid main() {\n  gl_Position = vec4(position, 1);\n  fcolor = color;\n}\n\n"; // eslint-disable-line

    let gl$1;

    (function start(config) {
      // TODO:
      // check compatability / support.

      document.addEventListener("DOMContentLoaded", function loaded() {
        const canvas = document.createElement("canvas");

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        document.body.prepend(canvas);

        window.addEventListener("resize", function onresize() {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;

          if (gl$1) gl$1.viewport(0, 0, canvas.width, canvas.height);
        });

        gl$1 = canvas.getContext("webgl2");

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
        FRAGMENT_SHADER
      } = gl$1;

      let vec_01 = new Vector(1.0, -1.0, 0.0);
      let vec_02 = new Vector(0.0, 1.0, 0.0);
      let vec_03 = new Vector(-1.0, -1.0, 0.0);

      let color_01 = new Vector(1.0, 0.0, 0.0, 1.0);
      let color_02 = new Vector(0.0, 1.0, 0.0, 1.0);
      let color_03 = new Vector(0.0, 0.0, 1.0, 1.0);

      const vertices = new Float32Array([...vec_01, ...vec_02, ...vec_03]);

      const colors = new Float32Array([...color_01, ...color_02, ...color_03]);

      const triangleVerticesBuffer = egl.createBuffer(
        ARRAY_BUFFER,
        vertices,
        STATIC_DRAW
      );

      const triangleColorsBuffer = egl.createBuffer(
        ARRAY_BUFFER,
        colors,
        STATIC_DRAW
      );

      const vertexShader = egl.createShader(VERTEX_SHADER, vertexShaderSource);

      const fragmentShader = egl.createShader(
        FRAGMENT_SHADER,
        fragmentShaderSource
      );

      const shaderProgram = egl.createProgram(vertexShader, fragmentShader);

      egl.createAttribute(
        shaderProgram,
        ARRAY_BUFFER,
        triangleVerticesBuffer,
        "position",
        3,
        FLOAT
      );
      egl.createAttribute(
        shaderProgram,
        ARRAY_BUFFER,
        triangleColorsBuffer,
        "color",
        4,
        FLOAT
      );

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
