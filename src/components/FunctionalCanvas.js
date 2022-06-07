import React, { useEffect, useRef, useState } from "react";
import * as p5 from "p5";
import { SketchPicker } from "react-color";

/*
        TODO
  * - not necessary 

[+] Open files from input
[+] Reassign variables of image after loading
[+] Try open large images / with diffrent sizes
  [] Fix bug while open tall image
  [] Better calculate width and height of drawing image in canvas
[+] Detect all pixels with same color
[+] Debounced color picker
[+] Change color of picked pixels and display it
[+] Change other pixels' colors proportionaly to inversion of absolute value of diffrence between picked color and new color
[+] Change proportion with slider 
[+] Create slider of strength of mixing old image with new colors
[+] Save edited image (download to PC)
*/

export default function Canvas() {
  let myRef = React.createRef();
  const [myP5, setMyP5] = useState(null);
  const [proportionFactor, setProportionFactor] = useState(50);
  const [powerChange, setPowerChange] = useState(100);
  const [selectedColorStyle, setSelectedColorStyle] = useState(null);
  const [newSelectedColorStyle, setNewSelectedColorStyle] = useState(null);

  //State for new image loaded by user from input
  const [newImage, setNewImage] = useState(null);

  const changeProportionFactor = (e) => {
    setProportionFactor(e.target.value);
  };

  const changePowerChange = (e) => {
    setPowerChange(e.target.value);
  };

  //Ref for hidden input form
  const inputFile = useRef(null);

  let Sketch = (p) => {
    //Variable contains original image loaded with p5
    let image = null;
    //Variable contains selected color from click at specific image
    //Used for change background color of div
    let selectedColor = "rgb(0, 0, 0)";
    //Dimiension of p5 canvas
    let dimension;
    //Original size of image
    let size = { width: 0, height: 0 };
    //Store p5 canvas
    let canvas;
    //Store pixels with similar color
    let similarColorPixels = [];

    p.preload = () => {
      console.log("Preload, loading image...");
      //Loading image before setup function
      image = p.loadImage(newImage || "./baloons.jpeg", () => {
        console.log("selected pixel", selectedColorStyle);
        if (newSelectedColorStyle && selectedColorStyle) {
          // console.log(newSelectedColorStyle);
          image.loadPixels();
          let color2 = {
            R: selectedColorStyle.rgb.R,
            G: selectedColorStyle.rgb.G,
            B: selectedColorStyle.rgb.B,
          };
          for (let i = 0; i < image.pixels.length; i += 4) {
            // console.log(image.pixels[i]);
            let R = image.pixels[i];
            let G = image.pixels[i + 1];
            let B = image.pixels[i + 2];

            if (isEqualPixel({ R, G, B }, color2)) {
              similarColorPixels.push(i);

              image.pixels[i] =
                ((newSelectedColorStyle.rgb.r - image.pixels[i]) *
                  powerChange) /
                  100 +
                image.pixels[i];
              image.pixels[i + 1] =
                ((newSelectedColorStyle.rgb.g - image.pixels[i + 1]) *
                  powerChange) /
                  100 +
                image.pixels[i + 1];
              image.pixels[i + 2] =
                ((newSelectedColorStyle.rgb.b - image.pixels[i + 2]) *
                  powerChange) /
                  100 +
                image.pixels[i + 2];
            } else {
              image.pixels[i] =
                (image.pixels[i] * (100 - proportionFactor)) / 100 +
                (newSelectedColorStyle.rgb.r * proportionFactor) / 100;
              image.pixels[i + 1] =
                (image.pixels[i + 1] * (100 - proportionFactor)) / 100 +
                (newSelectedColorStyle.rgb.g * proportionFactor) / 100;
              image.pixels[i + 2] =
                (image.pixels[i + 2] * (100 - proportionFactor)) / 100 +
                (newSelectedColorStyle.rgb.b * proportionFactor) / 100;
            }
          }
          image.updatePixels();
        }
      });
    };

    p.setup = () => {
      //console.log("Setup...", image);
      console.log(myP5);
      //Measure dimensions
      //Could be changed in final version of app
      dimension = p.min(p.windowWidth / 1.5, p.windowHeight / 1.5);
      //Maximum frame rate of canvas
      p.frameRate(60);
      //p.windowWidth * 0.85, p.windowHeight * 1.0
      //Create Canvas
      canvas = p.createCanvas(dimension, dimension);
      //canvas = p.createCanvas(image.width, image.height);
      //Center canvas in window
      let x = p5.windowWidth - p5.width;
      let y = p5.windowHeight - p5.height;
      canvas.position(x, y);
      //Handle click on canvas
      canvas.mouseClicked(p.handleClick);
    };

    p.draw = () => {
      //Set background
      p.background("rgb(255,255,255)");
      //Draw image
      if (image) {
        p.image(image, 0, 0, p.width, (image.height * p.width) / image.width);
        //Assign sizes of image
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

    //Resize canvas on window resize
    p.windowResized = () => {
      dimension = p.min(p.windowWidth / 1.5, p.windowHeight / 1.5);
      p.resizeCanvas(dimension, dimension);
    };

    //Function to handle click on canvas
    p.handleClick = (e) => {
      //Check if click was inside image
      if (clickInImage(size, e.layerX, e.layerY)) {
        console.log("Click at [", e.layerX, e.layerY, "]");
        image.loadPixels();
        getColorFromPixel(image, e.layerX, e.layerY);
        setNewSelectedColorStyle(null);
      }
    };

    //Check if mouse position is inside image
    const clickInImage = (size, x, y) => {
      return x <= size.width && y <= size.height;
    };

    //Get R G B values of clicked pixel
    //Returns stringify value 'rgb(R,G,B)'
    const getColorFromPixel = (image, x, y) => {
      let imageX = parseInt(p.map(x, 0, size.width, 0, image.width));
      let imageY = parseInt(p.map(y, 0, size.height, 0, image.height));
      console.log(imageX, imageY);
      let R = image.pixels[4 * (imageX + imageY * image.width)];
      let G = image.pixels[4 * (imageX + imageY * image.width) + 1];
      let B = image.pixels[4 * (imageX + imageY * image.width) + 2];
      selectedColor = { RGBstring: numToRGBString(R, G, B), rgb: { R, G, B } };
      setSelectedColorStyle(selectedColor);
    };

    //Converts R G B values to string 'rgb(R,G,B)'
    const numToRGBString = (R, G, B) => {
      return "rgb(" + R + "," + G + "," + B + ")";
    };

    const isEqualPixel = ({ R, G, B }, pixel) => {
      return R === pixel.R && G === pixel.G && B === pixel.B;
    };
  };

  //Create Sketch on window load
  useEffect(() => {
    if (myP5) myP5.remove();
    setMyP5(new p5(Sketch, myRef.current));
    // eslint-disable-next-line
  }, []);

  //Opens hidden file input
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

  //Read new image from file and save to newImage state
  const readNewImage = (file) => {
    let reader = new FileReader();
    reader.onload = function (ev) {
      setNewImage(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const resetImageHandle = async (e) => {
    e.preventDefault();
    setNewSelectedColorStyle(null);
    setProportionFactor(50);
    setPowerChange(100);
    // setSelectedColorStyle(null);
  };

  //Don't know what is better way to load new image into Sketch
  //So just creting new Sketch
  //And in preload function it loads new image
  useEffect(() => {
    if (myP5 && newImage) {
      setNewSelectedColorStyle(null);
      myP5.remove();
      setMyP5(new p5(Sketch, myRef.current));
    }
    // eslint-disable-next-line
  }, [newImage]);

  useEffect(() => {
    console.log("Change selected color! ", newSelectedColorStyle);
    if (selectedColorStyle) {
      const timeoutID = setTimeout(() => {
        if (myP5) {
          myP5.remove();
          setMyP5(new p5(Sketch, myRef.current));
        }
      }, 50);
      return () => {
        clearTimeout(timeoutID);
      };
    }
    // eslint-disable-next-line
  }, [newSelectedColorStyle, proportionFactor, powerChange]);

  return (
    <div className="container app">
      <div className="row h-100 picker">
        <div className="col-12 col-lg-3 picker__column">
          <SketchPicker
            color={
              newSelectedColorStyle ||
              selectedColorStyle?.RGBstring ||
              "rgb(0,0,0)"
            }
            onChangeComplete={setNewSelectedColorStyle}
          />
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
            style={{ display: "none" }}
            onChange={onChangeImageFile.bind(this)}
          />
          <button
            className="btn btn-info text-light"
            style={{ fontWeight: "bold" }}
            onClick={onFileInputClick}
          >
            Upload file
          </button>
          <button
            className="btn btn-info text-light my-3 font-weight-bold"
            style={{ fontWeight: "bold" }}
            onClick={saveImg}
          >
            Save file
          </button>
          <button
            className="btn btn-danger text-light my-3"
            onClick={resetImageHandle}
          >
            Reset image
          </button>
        </div>
        <div className="col-12 col-lg-9 picker__column d-flex align-items-center">
          <div
            className="canvas-div"
            style={{
              display: "flex",
              justifyContent: "center",
            }}
            ref={myRef}
          />
        </div>
      </div>
    </div>
  );
}
