import React, { useEffect, useRef, useState } from "react";
import * as p5 from "p5";
import { SketchPicker, SliderPicker } from "react-color";

export default function Canvas() {
  let myRef = React.createRef();
  const [myP5, setMyP5] = useState(null);
  const [proportionFactor, setProportionFactor] = useState(50);
  const [powerChange, setPowerChange] = useState(100);
  const [oldColor, setOldColor] = useState(null);
  const [newColor, setNewColor] = useState(null);
  const [newImage, setNewImage] = useState(null);

  const inputFile = useRef(null);

  const Sketch = (p) => {
    let image = null;
    let selectedColor = "rgb(0, 0, 0)";
    let dimension;
    let size = { width: 0, height: 0 };
    let canvas;

    p.preload = () => {
      image = p.loadImage(newImage || "./baloons.jpeg", () => {
        if (newColor && oldColor) {
          image.loadPixels();
          let color2 = {
            R: oldColor.rgb.R,
            G: oldColor.rgb.G,
            B: oldColor.rgb.B,
          };
          for (let i = 0; i < image.pixels.length; i += 4) {
            let R = image.pixels[i];
            let G = image.pixels[i + 1];
            let B = image.pixels[i + 2];

            if (isSimilarPixel({ R, G, B }, color2, proportionFactor)) {
              image.pixels[i] =
                ((newColor.rgb.r - image.pixels[i]) * powerChange) / 100 +
                image.pixels[i];
              image.pixels[i + 1] =
                ((newColor.rgb.g - image.pixels[i + 1]) * powerChange) / 100 +
                image.pixels[i + 1];
              image.pixels[i + 2] =
                ((newColor.rgb.b - image.pixels[i + 2]) * powerChange) / 100 +
                image.pixels[i + 2];
            }
          }
          image.updatePixels();
        }
      });
    };

    p.setup = () => {
      dimension = p.min(p.windowWidth / 1.5, p.windowHeight / 1.5);
      p.frameRate(60);
      canvas = p.createCanvas(dimension, dimension);
      let x = p5.windowWidth - p5.width;
      let y = p5.windowHeight - p5.height;
      canvas.position(x, y);
      canvas.mouseClicked(p.handleClick);
    };

    p.draw = () => {
      p.frameRate(60);
      p.background("rgb(255,255,255)");
      if (image) {
        p.image(image, 0, 0, p.width, (image.height * p.width) / image.width);
        size = {
          width: parseInt(p.width),
          height: parseInt((image.height * p.width) / image.width),
        };
      }
    };

    p.keyPressed = () => {
      if (p.key === "s") {
        image.updatePixels();
        image.save("korekty_barw", "png");
      }
    };

    p.windowResized = () => {
      dimension = p.min(p.windowWidth / 1.5, p.windowHeight / 1.5);
      p.resizeCanvas(dimension, dimension);
    };

    p.handleClick = (e) => {
      if (clickInImage(size, e.layerX, e.layerY)) {
        image.loadPixels();
        getColorFromPixel(image, e.layerX, e.layerY);
        setNewColor(null);
      }
    };

    const clickInImage = (size, x, y) => {
      return x <= size.width && y <= size.height;
    };

    const getColorFromPixel = (image, x, y) => {
      let imageX = parseInt(p.map(x, 0, size.width, 0, image.width));
      let imageY = parseInt(p.map(y, 0, size.height, 0, image.height));
      let R = image.pixels[4 * (imageX + imageY * image.width)];
      let G = image.pixels[4 * (imageX + imageY * image.width) + 1];
      let B = image.pixels[4 * (imageX + imageY * image.width) + 2];
      selectedColor = { RGBstring: numToRGBString(R, G, B), rgb: { R, G, B } };
      setOldColor(selectedColor);
    };

    const numToRGBString = (R, G, B) => {
      return "rgb(" + R + "," + G + "," + B + ")";
    };

    const isSimilarPixel = ({ R, G, B }, pixel, max_diffrence) => {
      return (
        Math.abs(R - pixel.R) <= max_diffrence &&
        Math.abs(G - pixel.G) <= max_diffrence &&
        Math.abs(B - pixel.B) <= max_diffrence
      );
    };
  };

  const changeProportionFactor = (e) => {
    setProportionFactor(e.target.value);
  };

  const changePowerChange = (e) => {
    setPowerChange(e.target.value);
  };

  const onFileInputClick = () => {
    inputFile.current.click();
  };

  const saveImg = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "s",
      })
    );
  };

  const onChangeImageFile = (e) => {
    e.stopPropagation();
    e.preventDefault();
    readNewImage(e.target.files[0]);
  };

  const readNewImage = (file) => {
    let reader = new FileReader();
    reader.onload = function (ev) {
      setNewImage(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const resetImageHandle = async (e) => {
    e.preventDefault();
    setNewColor(null);
    setProportionFactor(50);
    setPowerChange(100);
  };

  useEffect(() => {
    if (myP5) myP5.remove();
    setMyP5(new p5(Sketch, myRef.current));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (myP5 && newImage) {
      setNewColor(null);
      myP5.remove();
      setMyP5(new p5(Sketch, myRef.current));
    }
    // eslint-disable-next-line
  }, [newImage]);

  useEffect(() => {
    if (oldColor) {
      const timeoutID = setTimeout(() => {
        if (myP5) {
          myP5.remove();
          setMyP5(new p5(Sketch, myRef.current));
        }
      }, 100);
      return () => {
        clearTimeout(timeoutID);
      };
    }
    // eslint-disable-next-line
  }, [newColor, proportionFactor, powerChange]);

  return (
    <div className="container app">
      <div className="row h-100 picker">
        <div className="col-12 col-lg-3 picker__column">
          <h1 className="picker__title">
            1) Click on the image to choose pixel
          </h1>
          <div className="picker__pickers">
            <div className="picker__picker-info">
              <label className="mb-2">Old color</label>
              <SliderPicker color={oldColor?.RGBstring || "rgb(0,0,0)"} />
            </div>
            <div className="picker__picker-info">
              <label className="mb-2"> 2) Choose new color below</label>
              <SketchPicker
                color={newColor || oldColor?.RGBstring || "rgb(0,0,0)"}
                onChangeComplete={setNewColor}
              />
            </div>
          </div>

          <div className="picker__sliders">
            <label htmlFor="proportionFactor" className="form-label">
              Proportionality factor
            </label>
            <input
              type="range"
              className="form-range"
              id="proportionFactor"
              value={proportionFactor}
              onChange={changeProportionFactor}
            />
            <label htmlFor="changePower" className="form-label">
              Power of change
            </label>
            <input
              type="range"
              className="form-range"
              id="changePower"
              value={powerChange}
              onChange={changePowerChange}
            />
          </div>
          <input
            type="file"
            id="image-file-input"
            ref={inputFile}
            className="d-none"
            onChange={onChangeImageFile.bind(this)}
          />
          <div className="d-flex justify-content-between w-100">
            <button
              className="btn btn-info font-weight-bold text-light my-3"
              onClick={onFileInputClick}
            >
              Upload file
            </button>
            <button
              className="btn btn-info text-light my-3 font-weight-bold"
              onClick={saveImg}
            >
              Save file
            </button>
          </div>

          <button
            className="btn btn-danger text-light my-3"
            onClick={resetImageHandle}
          >
            Reset image
          </button>
        </div>
        <div className="col-12 col-lg-9 picker__column d-flex align-items-center">
          <div
            className="canvas-div d-flex jsutify-center"
            ref={myRef}
          />
        </div>
      </div>
    </div>
  );
}
