import React, { useEffect, useState } from "react";
import * as p5 from "p5";

/*
        TODO
  * - not necessary 

[] Debounced color picker
[] Try open large images / with diffrent sizes
[] Open files from input
[] Reassign variables of image after loading
[] Change color of picked pixels
[] Save edited image 
[] * Create Drag and drop option 
*/

export default function Canvas() {
  let myRef = React.createRef();
  const [myP5, setMyP5] = useState(null);
  const [selectedColorStyle, setSelectedColorStyle] = useState("rgb(0, 0, 0)"); // For selected pixel color div

  let Sketch = (p) => {
    let image = null;
    let selectedColor = "rgb(0, 0, 0)";
    let dimension;
    let size = { width: 0, height: 0 };
    let canvas;

    p.preload = () => {
      console.log("Preload, loading image...");
      image = p.loadImage("./test2.png");
      image.loadPixels();
    };

    p.setup = () => {
      dimension = p.min(p.windowWidth / 1.5, p.windowHeight / 1.5);
      p.frameRate(60);
      //p.windowWidth * 0.85, p.windowHeight * 1.0
      canvas = p.createCanvas(dimension, dimension);
      let x = p5.windowWidth - p5.width;
      let y = p5.windowHeight - p5.height;
      canvas.position(x, y);
      canvas.mouseClicked(p.handleClick);
    };

    p.draw = () => {
      //p.translate(p.width / 2, p.height / 2); // Center the canvas so that 0,0 is the center
      p.background("rgb(100,100,100)");

      if (image) {
        p.image(image, 0, 0, p.width, (image.height * p.width) / image.width);
        size = {
          width: parseInt(p.width),
          height: parseInt((image.height * p.width) / image.width),
        };
      }
    };

    p.windowResized = () => {
      dimension = p.min(p.windowWidth / 1.5, p.windowHeight / 1.5);
      p.resizeCanvas(dimension, dimension);
    };

    p.handleClick = (e) => {
      if (clickInImage(size, e.layerX, e.layerY)) {
        console.log("Click at [", e.layerX, e.layerY, "]");
        image.loadPixels();
        getColorFromPixel(image, e.layerX, e.layerY);
      }
    };

    let clickInImage = (size, x, y) => {
      return x <= size.width && y <= size.height;
    };

    let getColorFromPixel = (image, x, y) => {
      let imageX = parseInt(p.map(x, 0, size.width, 0, image.width));
      let imageY = parseInt(p.map(y, 0, size.height, 0, image.height));
      console.log(imageX, imageY);
      let R = image.pixels[4 * (imageX + imageY * image.width)];
      let G = image.pixels[4 * (imageX + imageY * image.width) + 1];
      let B = image.pixels[4 * (imageX + imageY * image.width) + 2];
      selectedColor = numToRGBString(R, G, B);
      setSelectedColorStyle(selectedColor);
    };

    let numToRGBString = (R, G, B) => {
      return "rgb(" + R + "," + G + "," + B + ")";
    };
  };

  useEffect(() => {
    if (myP5) myP5.remove();
    setMyP5(new p5(Sketch, myRef.current));
  }, []);

  // useLayoutEffect(() => {
  //   return () => {
  //     myP5.remove();
  //   };
  // }, []);

  return (
    <div>
      <input
        type="color"
        id="head"
        name="head"
        onChange={(e) => {
          console.log("change", e.target.value);
        }}
      ></input>
      <div
        className="selected-color"
        style={{
          backgroundColor: selectedColorStyle,
          width: "100px",
          height: "100px",
        }}
      ></div>
      {/* Real canvas div */}
      <div
        className="canvas-div"
        style={{
          display: "flex",
          justifyContent: "center",
        }}
        ref={myRef}
      />
    </div>
  );
}
