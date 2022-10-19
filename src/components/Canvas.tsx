import React, { FC, useEffect, useRef } from "react";
import Draw from "../tools/Draw";

const Canvas: FC = () => {
  const canvasRef = useRef<any>();
  const buttonRef = useRef<any>();

  useEffect(()=> {
    new Draw(canvasRef.current, buttonRef.current)
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="canvas"
        width={600}
        height={400}
      ></canvas>
      <div className="batton-container">
        <button ref={buttonRef}>Collapse lines</button>
      </div>
    </>
  );
};

export default Canvas;
