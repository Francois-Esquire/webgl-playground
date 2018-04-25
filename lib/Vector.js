const _instances = new WeakSet();

export default class Vector {
  constructor(x, y, z, w) {
    this.x = x.toFixed() || 0.0;
    this.y = y.toFixed() || 0.0;
    if (isNaN(z) === false) this.z = z.toFixed();
    if (isNaN(w) === false) this.w = w.toFixed();

    _instances.add(this);
  }

  clone() {
    return new Vector(...this);
  }

  translate(transform) {
    const { x, y, z, w } = transform;

    if (x) this.x = x.toFixed();
    if (y) this.y = y.toFixed();
    if (z) this.z = z.toFixed();
    if (w) this.w = w.toFixed();

    return this;
  }

  invert() {
    for (let point of this.keys) {
      this[point] = this[point] *= -1;
    }

    return this;
  }

  // recursive calling going on...
  // this would work better with all four keys on a proxy.
  // explore a more suitable expression around this idea.
  // set w(value) {
  //   const { keys, array } = this;
  //
  //   if (array.includes(undefined)) {
  //     // find the first undefined value nad assign to it.
  //     this[keys[array.indexOf(undefined)]] = value;
  //   } else this.w = value;
  //
  //   return value;
  // }

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

        return [x, y].concat(z || [], w || []);
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
        return JSON.stringify(this);
    }
  }
}

Object.defineProperties(Vector, {
  [Symbol.hasInstance]: {
    value(instance) {
      return _instances.has(instance);
    },
  },
  [Symbol.toStringTag]: {
    get() {
      // will always be Vector4, counts formal arguments.
      return `Vector${this.length}`;
    },
  },
});
