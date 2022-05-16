import React from "react";
import * as p5 from "p5";

class Canvas extends React.Component {
  constructor() {
    super();
    this.myRef = React.createRef();
  }

  Sketch = (p) => {
    let dimension, canvas;
    // Loads the music file into p5.js to play on click
    p.preload = () => {
      console.log(1233213);
    };

    // Initial setup to create canvas and audio analyzers
    p.setup = () => {
      dimension = p.min(p.windowWidth / 1.5, p.windowHeight / 1.5);
      p.frameRate(60);

      canvas = p.createCanvas(dimension, dimension);
      canvas.mouseClicked(p.handleClick);
    };

    p.draw = () => {
      p.translate(p.width / 2, p.height / 2); // Center the canvas so that 0,0 is the center
      p.background("rgb(0,0,0)");
    };

    p.windowResized = () => {
      dimension = p.min(p.windowWidth / 1.5, p.windowHeight / 1.5);
      p.resizeCanvas(dimension, dimension);
    };

    p.handleClick = () => {
      console.log("click");
    };
  };

  // React things to make p5.js work properly and not lag when leaving the current page below
  componentDidMount() {
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  componentDidUpdate() {
    this.myP5.remove();
    this.myP5 = new p5(this.Sketch, this.myRef.current);
  }

  componentWillUnmount() {
    this.myP5.remove();
  }

  render() {
    return (
      <div className="flex flex-wrap lg:flex-nowrap mt-8 w-full justify-center items-center">
        {/* The actaual canvas for p5.js */}
        <div className="flex justify-center" ref={this.myRef} />
      </div>
    );
  }
}

export default Canvas;
