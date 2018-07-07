const _instances = new WeakSet();

interface Point {
  x: number;
  y: number;
  z: number;
  w: number;
}

export default class Vector implements Point {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(...args: any[]) {
    const { x, y, z, w } = Vector.input(...args);

    if (x) this.x = x;
    if (y) this.y = y;
    if (z) this.z = z;
    if (w) this.w = w;

    _instances.add(this);
  }

  public clone(): Vector {
    return new Vector(this);
  }

  public translate(...args: any[]): Vector {
    const { x, y, z, w } = Vector.input(...args);

    if (x) this.x = x;
    if (y) this.y = y;
    if (z) this.z = z;
    if (w) this.w = w;

    return this;
  }

  private get array(): number[] {
    return Array.from(this);
  }

  get length(): number {
    return this.array.length;
  }

  static create(vector: any): Vector {
    return vector instanceof Vector ? vector.clone() : new Vector(vector);
  }

  static delete(ref: Vector) {
    _instances.delete(ref);
  }

  private static input(...args: any[]): Point {
    const transform = (args.length > 1 ? args : args[0]) || {};

    let { x, y, z, w } =
      transform instanceof Array
        ? transform.reduce((map, t, i) => {
            Object.assign(map, {
              [String.fromCharCode(119 + (i === 3 ? 0 : i + 1))]: t
            });

            return map;
          }, {})
        : transform;

    x = typeof x === "number" ? x.toFixed() : 0.0;
    y = typeof y === "number" ? y.toFixed() : 0.0;
    if (typeof z === "number") z = z.toFixed();
    if (typeof w === "number") w = w.toFixed();

    return Object.assign(Object.create(null), {
      x,
      y,
      z,
      w
    });
  }

  [Symbol.iterator]() {
    return {
      points: (function _toArray(vec: Vector) {
        const { x, y, z, w } = vec;

        return [x, y].concat(z || (w ? undefined : []), w || []);
      })(this),
      next() {
        return { done: this.points.length === 0, value: this.points.shift() };
      }
    };
  }

  [Symbol.toPrimitive](hint: string) {
    switch (hint) {
      default:
        throw new Error();
      case "default":
        return this.length;
    }
  }

  get [Symbol.toStringTag]() {
    return `Vector${this.length}`;
  }

  static [Symbol.hasInstance](instance: any) {
    return _instances.has(instance);
  }
}
