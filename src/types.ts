import { Dispatch, SetStateAction } from "react";

export type TCanvas = {
  lines: TLines[];
  setLines: Dispatch<SetStateAction<TLines[]>>;
  dots: TDots[];
  setDots: Dispatch<SetStateAction<TDots[]>>;
};

export type TPoint = {
  x: number;
  y: number;
};

export type TBounds = {
  max: number;
  min: number;
};

export type TLines = {
  x: number;
  y: number;
  currentX: number;
  currentY: number;
  length: number;
};

export type TDots = {
  x: number;
  y: number;
};
