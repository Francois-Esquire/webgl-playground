interface Point {
  x: number;
  y: number;
  z: number;
  w: number;
}

export default class Vector implements Point {
  public x: number = 0.0;
  public y: number = 0.0;
  public z: number;
  public w: number;

  protected static _instances = new WeakSet();

  constructor(...args: Array<any>) {
    const { x, y, z, w } = Vector._input(...args);

    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;

    Vector._instances.add(this);
  }

  public clone(): Vector {
    return new Vector(this);
  }

  public translate(...args: Array<any>): Vector {
    const { x, y, z, w } = Vector._input(...args);

    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;

    return this;
  }

  public get length(): number {
    return this._array.length;
  }

  private get _array(): Array<number> {
    return Array.from(this);
  }

  public static create(vector: any): Vector {
    return vector instanceof Vector ? vector.clone() : new Vector(vector);
  }

  public static delete(ref: Vector): void {
    Vector._instances.delete(ref);
  }

  private static _input(...args: Array<any>): Point {
    const transform = (args.length > 1 ? args : args[0]) || {};

    const { x, y, z, w }: Point =
      transform instanceof Array
        ? transform.reduce((map, t, i): Point => {
            Object.assign(map, {
              [String.fromCharCode(119 + (i === 3 ? 0 : i + 1))]: t
            });

            return map;
          }, {})
        : transform;

    return Object.assign(Object.create(null), {
      x,
      y,
      z,
      w
    });
  }

  [Symbol.iterator]() {
    return {
      points: (function _toArray(vec: Vector): Array<number> {
        const { x, y, z, w } = vec;

        return [x, y].concat(
          typeof z === "number" ? z : typeof w === "number" ? undefined : [],
          typeof w === "number" ? w : []
        );
      })(this),
      next() {
        return { done: this.points.length === 0, value: this.points.shift() };
      }
    };
  }

  [Symbol.toPrimitive](hint: string): Error | number {
    switch (hint) {
      default:
        throw new Error();
      case "default":
        return this.length;
    }
  }

  get [Symbol.toStringTag](): string {
    return `Vector${this.length}`;
  }

  // static [Symbol.hasInstance](instance: any): boolean {
  //   return Vector._instances.has(instance);
  // }
}
