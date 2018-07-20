import stream from "stream";

export default class Cache extends stream.Duplex {
  constructor(options = {}) {
    super(options);

    this.generateCapacitor();

    this.pause();

    this.on("readable", () => {
      let data;

      while ((data = this.read())) {
        this.capacitor.push(data);
      }

      setImmediate(() => this.capacitor.push(null));
    }).on("error", err => {
      console.log(err);
    });
  }

  generateCapacitor() {
    const html = [];

    this.capacitor = new stream.Readable({
      read(size) {
        let chunk;

        if ((chunk = this.read(size))) html.push(chunk);
      }
    }).once("end", () => {
      this.generateCapacitor();
      html.forEach(c => this.write(c));
    });
  }

  _write(chunk, encoding, done) {
    this.push(chunk);
    done();
  }

  _read(size) {}
}
