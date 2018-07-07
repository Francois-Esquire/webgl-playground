(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.gl = {})));
}(this, (function (exports) { 'use strict';

    var Matrix = /** @class */ (function () {
        function Matrix() {
        }
        return Matrix;
    }());

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
            if (x)
                { this.x = x; }
            if (y)
                { this.y = y; }
            if (z)
                { this.z = z; }
            if (w)
                { this.w = w; }
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
            if (x)
                { this.x = x; }
            if (y)
                { this.y = y; }
            if (z)
                { this.z = z; }
            if (w)
                { this.w = w; }
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
            x = typeof x === "number" ? x : 0.0;
            y = typeof y === "number" ? y : 0.0;
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
                    return [x, y].concat(z || (w ? undefined : []), w || []);
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
        Vector[Symbol.hasInstance] = function (instance) {
            return Vector._instances.has(instance);
        };
        Vector._instances = new WeakSet();
        return Vector;
    }());

    var Engine = /** @class */ (function () {
        function Engine(ctx) {
            exports.gl = ctx;
            this.run = this.run.bind(this);
        }
        Object.defineProperty(Engine.prototype, "viewport", {
            get: function () {
                return exports.gl.getParameter(exports.gl.VIEWPORT);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Engine.prototype, "maxViewportDimensions", {
            get: function () {
                return exports.gl.getParameter(exports.gl.MAX_VIEWPORT_DIMS);
            },
            enumerable: true,
            configurable: true
        });
        Engine.prototype.run = function () {
            exports.gl.clearColor(0, 0, 0, 1);
            exports.gl.clear(exports.gl.COLOR_BUFFER_BIT);
            exports.gl.drawArrays(exports.gl.TRIANGLES, 0, 3);
            requestAnimationFrame(this.run);
        };
        Engine.prototype.createBuffer = function (type, data, usage) {
            var buffer = exports.gl.createBuffer();
            console.log(buffer);
            exports.gl.bindBuffer(type, buffer);
            exports.gl.bufferData(type, data, usage || exports.gl.STATIC_DRAW);
            return buffer;
        };
        Engine.prototype.createAttribute = function (program, bufferType, buffer, variable, size, type, normalized, stride, offset) {
            if (type === void 0) { type = exports.gl.FLOAT; }
            if (normalized === void 0) { normalized = false; }
            if (stride === void 0) { stride = 0; }
            if (offset === void 0) { offset = 0; }
            var attributeLocation = exports.gl.getAttribLocation(program, variable);
            exports.gl.enableVertexAttribArray(attributeLocation);
            exports.gl.bindBuffer(bufferType, buffer);
            // gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
            exports.gl.vertexAttribPointer(attributeLocation, size, type, normalized, stride, offset);
            return attributeLocation;
        };
        Engine.prototype.createShader = function (type, source) {
            var shader = exports.gl.createShader(type);
            exports.gl.shaderSource(shader, source);
            exports.gl.compileShader(shader);
            var success = exports.gl.getShaderParameter(shader, exports.gl.COMPILE_STATUS);
            if (success)
                { return shader; }
            var info = exports.gl.getShaderInfoLog(shader);
            console.warn(info);
            exports.gl.deleteShader(shader);
            return null;
        };
        Engine.prototype.createProgram = function (vertexShader, fragmentShader) {
            var program = exports.gl.createProgram();
            exports.gl.attachShader(program, vertexShader);
            exports.gl.attachShader(program, fragmentShader);
            return this.linkProgram(program);
        };
        Engine.prototype.linkProgram = function (program) {
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
        };
        return Engine;
    }());

    exports.Matrix = Matrix;
    exports.Vector = Vector;
    exports.Engine = Engine;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
