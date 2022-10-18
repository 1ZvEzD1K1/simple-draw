import { TBounds, TLines, TPoint } from "../types";

export const getLength = (line: TLines): number => {
  return Math.sqrt(
    (line.currentX - line.x) ** 2 + (line.currentY - line.y) ** 2
  );
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getLineFunc = (
  point1: TPoint,
  point2: TPoint
): ((x: number) => number) => {
  let p1 = point1;
  let p2 = point2;
  return (x: number) => {
    if (x > Math.max(p1.x, p2.x) || x < Math.min(p1.x, p2.x)) return NaN;
    return p1.y + ((p2.y - p1.y) / (p2.x - p1.x)) * (x - p1.x);
  };
};

export const collapseLines = (line: TLines): TLines => {
  let lineFunc = getLineFunc(
    { x: line.x, y: line.y },
    { x: line.currentX, y: line.currentY }
  );
  let center = (line.x + line.currentX) / 2;
  let targetX = center + (line.x - center) * (1 - 5 / getLength(line));
  let targetCurrentX =
    center + (line.currentX - center) * (1 - 5 / getLength(line));
  let newLine = {
    length: line.length,
    x: targetX,
    currentX: targetCurrentX,
    y: lineFunc(targetX),
    currentY: lineFunc(targetCurrentX),
  };
  if (getLength(newLine) < 3) {
    return { ...newLine, length: -1 };
  }
  return newLine;
};

export const getBounds = (l1: TLines, l2: TLines): TBounds => {
  return {
    max: Math.max(Math.min(l1.currentX, l1.x), Math.min(l2.currentX, l2.x)),
    min: Math.min(Math.max(l1.currentX, l1.x), Math.max(l2.currentX, l2.x)),
  };
};

export const getCrossing = (
  f1: (x: number) => number,
  f2: (x: number) => number,
  bounds: TBounds
): TPoint => {
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
};
