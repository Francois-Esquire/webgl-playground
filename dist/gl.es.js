var Matrix = /** @class */ (function () {
    function Matrix() {
    }
    return Matrix;
}());

var _instances = new WeakSet();
var Vector = /** @class */ (function () {
    function Vector() {
        var arguments$1 = arguments;

        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments$1[_i];
        }
        var _a = Vector.input.apply(Vector, args), x = _a.x, y = _a.y, z = _a.z, w = _a.w;
        if (x)
            { this.x = x; }
        if (y)
            { this.y = y; }
        if (z)
            { this.z = z; }
        if (w)
            { this.w = w; }
        _instances.add(this);
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
        var _a = Vector.input.apply(Vector, args), x = _a.x, y = _a.y, z = _a.z, w = _a.w;
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
    Object.defineProperty(Vector.prototype, "array", {
        get: function () {
            return Array.from(this);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector.prototype, "length", {
        get: function () {
            return this.array.length;
        },
        enumerable: true,
        configurable: true
    });
    Vector.create = function (vector) {
        return vector instanceof Vector ? vector.clone() : new Vector(vector);
    };
    Vector.delete = function (ref) {
        _instances.delete(ref);
    };
    Vector.input = function () {
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
        x = typeof x === "number" ? x.toFixed() : 0.0;
        y = typeof y === "number" ? y.toFixed() : 0.0;
        if (typeof z === "number")
            { z = z.toFixed(); }
        if (typeof w === "number")
            { w = w.toFixed(); }
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
        return _instances.has(instance);
    };
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
        console.log(buffer);
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

export { Matrix, Vector, Engine, gl };
