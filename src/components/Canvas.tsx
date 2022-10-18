import React, { FC, useEffect, useRef } from "react";
import { useState } from "react";
import { collapseLines, getBounds, getCrossing, getLineFunc, sleep } from "../tools/collapsing";
import { TCanvas, TDots, TLines } from "../types";

const Canvas: FC<TCanvas> = ({ lines, setLines, dots, setDots }) => {
  const canvasRef = useRef<any>();
  const ctx = canvasRef.current?.getContext("2d");
  const [firstClick, setFirstClick] = useState<boolean>(true);
  const [currentX, setCurrentX] = useState<number>(0);
  const [currentY, setCurrentY] = useState<number>(0);
  const [moveDots, setMoveDots] = useState<TDots[]>([]);
  const [isCollapsing, setIsCollapsing] = useState<boolean>(false);

  useEffect(() => {
    if (isCollapsing) {
      sleep(10).then(() => {
        onHadlerCollapse();
      });
    }else {
      setDots((prev) => [...prev, ...moveDots]);
    }
    setMoveDots([])
  }, [lines]);

  const mouseClickHandler = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    setCurrentX(e.pageX - canvasRef.current?.offsetLeft);
    setCurrentY(e.pageY - canvasRef.current?.offsetTop);
    ctx?.beginPath();
    ctx?.moveTo(currentX, currentY);
    setFirstClick((prew) => !prew);
  };

  const onContextMenuHandler = (
    e: React.MouseEvent<HTMLCanvasElement>
  ): void => {
    e.preventDefault();
    if (!firstClick) {
      setMoveDots([]);
      mouseClickHandler(e);
      onMouseUp(e);
      setLines((prev) => {
        return prev.filter((el, id) => id != lines.length);
      });
      refreshCanvas();
    }
  };

  const mouseMoveHandler = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    if (!firstClick) {
      setMoveDots([]);
      refreshCanvas();
      drawLine(
        e.pageX - canvasRef.current?.offsetLeft,
        e.pageY - canvasRef.current?.offsetTop,
        currentX,
        currentY
      );
      getCollapsDots(
        e.pageX - canvasRef.current?.offsetLeft,
        e.pageY - canvasRef.current?.offsetTop,
        currentX,
        currentY
      );
      moveDots.forEach((dot) => {
        drawCircle(dot.x, dot.y);
      });
    }
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    if (!firstClick) {
      let targetLength = Math.sqrt(
        (e.pageX - canvasRef.current?.offsetLeft - currentX) ** 2 +
          (e.pageY - canvasRef.current?.offsetTop - currentY) ** 2
      );
      setLines((prev) => {
        return [
          ...prev,
          {
            x: e.pageX - canvasRef.current?.offsetLeft,
            y: e.pageY - canvasRef.current?.offsetTop,
            currentX,
            currentY,
            length: targetLength,
          },
        ];
      });
    }
  };

  const refreshCanvas = (): void => {
    ctx?.clearRect(0, 0, canvasRef.current?.width, canvasRef.current?.height);
    for (let i = 0; i < lines.length; i++) {
      drawLine(lines[i].x, lines[i].y, lines[i].currentX, lines[i].currentY);
    }
    for (let i = 0; i < dots.length; i++) {
      drawCircle(dots[i].x, dots[i].y);
    }
  };

  const getCollapsDots = (
    x: number,
    y: number,
    curX: number,
    curY: number
  ): void => {
    let currentLine = getLineFunc({ x, y }, { x: curX, y: curY });
    lines.forEach((dot) => {
      let targetLine = getLineFunc(
        { x: dot.currentX, y: dot.currentY },
        { x: dot.x, y: dot.y }
      );
      let collapse = getCrossing(
        currentLine,
        targetLine,
        getBounds({ x, y, currentX: curX, currentY: curY, length: 0 }, dot)
      );
      if (!isNaN(collapse.x)) {
        setMoveDots((prev) => [...prev, collapse]);
      }
    });
  };

  const getCollapse = (line1: TLines, line2: TLines): TDots => {
    let currentLine = getLineFunc(
      { x: line2.currentX, y: line2.currentY },
      { x: line2.x, y: line2.y }
    );
    let targetLine = getLineFunc(
      { x: line1.currentX, y: line1.currentY },
      { x: line1.x, y: line1.y }
    );
    let collapse = getCrossing(
      currentLine,
      targetLine,
      getBounds(
        {
          x: line2.x,
          y: line2.y,
          currentX: line2.currentX,
          currentY: line2.currentY,
          length: 0,
        },
        {
          x: line1.x,
          y: line1.y,
          currentX: line1.currentX,
          currentY: line1.currentY,
          length: 0,
        }
      )
    );
    return collapse;
  };

  const drawLine = (x: number, y: number, curX: number, curY: number) => {
    ctx?.beginPath();
    ctx?.moveTo(curX, curY);
    ctx?.lineTo(x, y);
    ctx?.stroke();
  };

  const onHadlerCollapse = () => {
    setIsCollapsing(lines.length != 0);
    refreshCanvas();
    setLines(
      lines
        .map((line) => {
          return collapseLines(line);
        })
        .filter((line) => line.length != -1)
    );
    setDots([]);
    for (let i = 0; i < lines.length; i++) {
      for (let j = i; j < lines.length; j++) {
        setDots((prev) => [...prev, getCollapse(lines[i], lines[j])]);
      }
    }
  };

  const drawCircle = (x: number, y: number): void => {
    ctx?.beginPath();
    ctx?.arc(x, y, 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = "red";
    ctx?.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx?.stroke();
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="canvas"
        width={600}
        height={400}
        onClick={(e) => mouseClickHandler(e)}
        onContextMenu={(e) => {
          onContextMenuHandler(e);
        }}
        onMouseMove={(e) => mouseMoveHandler(e)}
        onMouseUp={(e) => onMouseUp(e)}
      ></canvas>
      <div className="batton-container">
        <button onClick={onHadlerCollapse}>Collapse lines</button>
      </div>
    </>
  );
};

export default Canvas;
