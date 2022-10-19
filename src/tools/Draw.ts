import { TBounds, TDots, TLines, TPoint } from "../types";

export default class Draw {
  canvas: any;
  button: any;
  ctx: any;
  lines: TLines[];
  dots: TDots[];
  moveDots: TDots[];
  firstClick: boolean;
  currentX: number;
  currentY: number;
  isCollapsing: boolean;

  constructor(canvas: any, button: any) {
    this.canvas = canvas;
    this.button = button;
    this.ctx = canvas.getContext("2d");
    this.lines = [];
    this.dots = [];
    this.moveDots = [];
    this.firstClick = true;
    this.currentX = 0;
    this.currentY = 0;
    this.isCollapsing = false;
    this.listen();
  }

  listen() {
    this.canvas.onmousemove = this.mouseMoveHandler.bind(this);
    this.canvas.onclick = this.mouseClickHandler.bind(this);
    this.canvas.onmouseup = this.onMouseUp.bind(this);
    this.canvas.oncontextmenu = this.onContextMenuHandler.bind(this);
    this.button.onclick = this.onHadlerCollapse.bind(this);
  }

  mouseClickHandler(e: any): void {
    this.currentX = e.pageX - e.target.offsetLeft;
    this.currentY = e.pageY - e.target.offsetTop;
    this.ctx?.beginPath();
    this.ctx?.moveTo(this.currentX, this.currentY);
    this.firstClick = !this.firstClick;
  }

  onContextMenuHandler(e: any): void {
    e.preventDefault();
    if (!this.firstClick) {
      this.moveDots = [];
      this.mouseClickHandler(e);
      this.onMouseUp(e);
      this.lines = this.lines.filter((el, id) => id != this.lines.length);
      if (this.isCollapsing) {
        this.sleep(10).then(() => {
          this.onHadlerCollapse();
        });
      } else {
        this.dots = [...this.dots, ...this.moveDots];
      }
      this.moveDots = [];
      this.refreshCanvas();
    }
  }

  mouseMoveHandler(e: any): void {
    if (!this.firstClick) {
      this.moveDots = [];
      this.refreshCanvas();
      this.drawLine(
        e.pageX - e.target.offsetLeft,
        e.pageY - e.target.offsetTop,
        this.currentX,
        this.currentX
      );
      this.getCollapsDots(
        e.pageX - e.target.offsetLeft,
        e.pageY - e.target.offsetTop,
        this.currentX,
        this.currentX
      );
      this.moveDots.forEach((dot) => {
        this.drawCircle(dot.x, dot.y);
      });
    }
  }

  onMouseUp(e: any): void {
    if (!this.firstClick) {
      let targetLength = this.getLength({
        x: e.pageX - e.target.offsetLeft,
        y: e.pageY - e.target.offsetTop,
        currentX: this.currentX,
        currentY: this.currentY,
        length: 0,
      });
      this.lines = [
        ...this.lines,
        {
          x: e.pageX - e.target.offsetLeft,
          y: e.pageY - e.target.offsetTop,
          currentX: this.currentX,
          currentY: this.currentY,
          length: targetLength,
        },
      ];
      if (this.isCollapsing) {
        this.sleep(10).then(() => {
          this.onHadlerCollapse();
        });
      } else {
        this.dots = [...this.dots, ...this.moveDots];
      }
      this.moveDots = [];
    }
  }

  onHadlerCollapse(): void {
    this.isCollapsing = this.lines.length != 0;
    this.refreshCanvas();
    this.lines = this.lines
      .map((line) => {
        return this.collapseLines(line);
      })
      .filter((line) => line.length != -1);
    if (this.isCollapsing) {
      this.sleep(10).then(() => {
        this.onHadlerCollapse();
      });
    } else {
      this.dots = [...this.dots, ...this.moveDots];
    }
    this.moveDots = [];
    this.dots = [];
    for (let i = 0; i < this.lines.length; i++) {
      for (let j = i; j < this.lines.length; j++) {
        this.dots = [
          ...this.dots,
          this.getCollapse(this.lines[i], this.lines[j]),
        ];
      }
    }
  }

  drawLine(x: number, y: number, curX: number, curY: number): void {
    this.ctx?.beginPath();
    this.ctx?.moveTo(curX, curY);
    this.ctx?.lineTo(x, y);
    this.ctx?.stroke();
  }

  drawCircle(x: number, y: number): void {
    this.ctx?.beginPath();
    this.ctx?.arc(x, y, 5, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = "red";
    this.ctx?.fill();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "black";
    this.ctx?.stroke();
  }

  refreshCanvas(): void {
    this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.lines.length; i++) {
      this.drawLine(
        this.lines[i].x,
        this.lines[i].y,
        this.lines[i].currentX,
        this.lines[i].currentY
      );
    }
    for (let i = 0; i < this.dots.length; i++) {
      this.drawCircle(this.dots[i].x, this.dots[i].y);
    }
  }

  getCollapsDots(x: number, y: number, curX: number, curY: number): void {
    let currentLine = this.getLineFunc({ x, y }, { x: curX, y: curY });
    this.lines.forEach((dot) => {
      let targetLine = this.getLineFunc(
        { x: dot.currentX, y: dot.currentY },
        { x: dot.x, y: dot.y }
      );
      let collapse = this.getCrossing(
        currentLine,
        targetLine,
        this.getBounds({ x, y, currentX: curX, currentY: curY, length: 0 }, dot)
      );
      if (!isNaN(collapse.x)) {
        this.moveDots = [...this.moveDots, collapse];
      }
    });
  }

  getCollapse(line1: TLines, line2: TLines): TDots {
    let currentLine = this.getLineFunc(
      { x: line2.currentX, y: line2.currentY },
      { x: line2.x, y: line2.y }
    );
    let targetLine = this.getLineFunc(
      { x: line1.currentX, y: line1.currentY },
      { x: line1.x, y: line1.y }
    );
    let collapse = this.getCrossing(
      currentLine,
      targetLine,
      this.getBounds(
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
  }

  getBounds(l1: TLines, l2: TLines): TBounds {
    return {
      max: Math.max(Math.min(l1.currentX, l1.x), Math.min(l2.currentX, l2.x)),
      min: Math.min(Math.max(l1.currentX, l1.x), Math.max(l2.currentX, l2.x)),
    };
  }

  getCrossing(
    f1: (x: number) => number,
    f2: (x: number) => number,
    bounds: TBounds
  ): TPoint {
    let f = (x: number) => f1(x) - f2(x);
    let root = NaN;
    let mid: number = 0;
    while (Math.abs(f(bounds.max) - f(bounds.min)) > 0.01) {
      mid = (bounds.max + bounds.min) / 2;
      if (f(mid) == 0 || Math.abs(f(mid)) < 0.01) {
        root = mid;
        break;
      } else if (f(bounds.max) * f(mid) < 0) {
        bounds.min = mid;
      } else {
        bounds.max = mid;
      }
    }
    return { x: Math.round(root), y: Math.round((f1(root) + f2(root)) / 2) };
  }

  collapseLines(line: TLines): TLines {
    let lineFunc = this.getLineFunc(
      { x: line.x, y: line.y },
      { x: line.currentX, y: line.currentY }
    );
    let center = (line.x + line.currentX) / 2;
    let targetX = center + (line.x - center) * (1 - 5 / this.getLength(line));
    let targetCurrentX =
      center + (line.currentX - center) * (1 - 5 / this.getLength(line));
    let newLine = {
      length: line.length,
      x: targetX,
      currentX: targetCurrentX,
      y: lineFunc(targetX),
      currentY: lineFunc(targetCurrentX),
    };
    if (this.getLength(newLine) < 3) {
      return { ...newLine, length: -1 };
    }
    return newLine;
  }

  getLineFunc(point1: TPoint, point2: TPoint): (x: number) => number {
    return (x: number) => {
      if (x > Math.max(point1.x, point2.x) || x < Math.min(point1.x, point2.x))
        return NaN;
      return (
        point1.y +
        ((point2.y - point1.y) / (point2.x - point1.x)) * (x - point1.x)
      );
    };
  }

  getLength(line: TLines): number {
    return Math.sqrt(
      (line.currentX - line.x) ** 2 + (line.currentY - line.y) ** 2
    );
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
