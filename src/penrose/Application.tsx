import React from "react";

import Program from "./Program";

import Penrose from "./scenes/Penrose";

export default class Application extends React.PureComponent {
  public canvas: HTMLCanvasElement;
  public program: Program;
  public scenes: Penrose[] = [Penrose];

  constructor(props) {
    super(props);
  }

  componentDidMount(): void {
    const options = {
      audio: true,
      first: "Penrose"
    };

    // TODO:
    // check for webgl
    this.program = new Program(this.scenes, options);
  }

  render(): void {
    return <canvas ref={c => (this.canvas = c)} />;
  }
}
