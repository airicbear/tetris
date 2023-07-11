"use client";

import styles from "../styles/TetrisGame.module.css";
import Script from "next/script";
import { useEffect } from "react";

export const TetrisGame = () => {
  useEffect(() => {
    const CANVAS: HTMLCanvasElement = document.querySelector("canvas")!;
    const CONTEXT: CanvasRenderingContext2D = CANVAS.getContext("2d")!;

    const KEY_STATE = new Map();
    const GRID_WIDTH = 10;
    const GRID_HEIGHT = 20;
    const GRID_BUFFER_HEIGHT = 4;
    const TILE_SIZE = 25;
    const GRID_X = CANVAS.width / 2 - (TILE_SIZE * GRID_WIDTH) / 2;
    const GRID_Y = 0;
    const GRID_BACKGROUND_COLOR = "gray";

    function main() {
      const grid = new Grid({
        x: GRID_X,
        y: GRID_Y,
        width: GRID_WIDTH,
        height: GRID_HEIGHT,
        bufferHeight: GRID_BUFFER_HEIGHT,
        tileSize: TILE_SIZE,
      });

      const gridBackground = new GridBackground({
        grid: grid,
        color: GRID_BACKGROUND_COLOR,
      });

      function draw() {
        gridBackground.draw(CONTEXT);
        grid.draw(CONTEXT);
        requestAnimationFrame(draw);
      }

      draw();
    }

    enum GridTileValue {
      EMPTY = "black",
      CURRENT = "magenta",
      STRAIGHT = "cyan",
      SQUARE = "yellow",
      T = "purple",
      L = "blue",
      S = "green",
      Z = "red",
    }

    interface GridTileParams {
      row: number;
      column: number;
      value: GridTileValue;
    }

    class GridTile {
      private _row: number;
      private _column: number;
      private _value: GridTileValue;

      public get value(): GridTileValue {
        return this._value;
      }

      constructor({ row, column, value }: GridTileParams) {
        this._row = row;
        this._column = column;
        this._value = value;
      }
    }

    interface GridBackgroundParams {
      grid: Grid;
      color: string;
    }

    class GridBackground {
      private _grid: Grid;
      private _color: string;

      constructor({ grid, color }: GridBackgroundParams) {
        this._grid = grid;
        this._color = color;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.rect(
          this._grid.x,
          this._grid.y,
          this._grid.width * this._grid.tileSize,
          this._grid.totalHeight * this._grid.tileSize
        );
        ctx.fillStyle = this._color;
        ctx.fill();
        ctx.closePath();
      }
    }

    interface GridParams {
      x: number;
      y: number;
      width: number;
      height: number;
      bufferHeight: number;
      tileSize: number;
    }

    class Grid {
      private _x: number;
      private _y: number;
      private _width: number;
      private _height: number;
      private _bufferHeight: number;
      private _tileSize: number;
      private _grid: Array<Array<GridTile>>;

      public get x(): number {
        return this._x;
      }

      public get y(): number {
        return this._y;
      }

      public get width(): number {
        return this._width;
      }

      public get totalHeight(): number {
        return this._height + this._bufferHeight;
      }

      public get tileSize(): number {
        return this._tileSize;
      }

      constructor({ x, y, width, height, bufferHeight, tileSize }: GridParams) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._bufferHeight = bufferHeight;
        this._tileSize = tileSize;
        this._grid = [];
        this.initializeGrid();
      }

      initializeGrid() {
        for (let row = 0; row < this.totalHeight; row++) {
          const rowArray: Array<GridTile> = [];
          for (let col = 0; col < this.width; col++) {
            rowArray.push(
              new GridTile({
                row: row,
                column: col,
                value: GridTileValue.EMPTY,
              })
            );
          }
          this._grid.push(rowArray);
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        for (let row = 0; row < this.totalHeight; row++) {
          for (let col = 0; col < this.width; col++) {
            ctx.beginPath();
            ctx.rect(
              this.x + col * this.tileSize,
              this.y + row * this.tileSize,
              this.tileSize,
              this.tileSize
            );
            ctx.fillStyle = this._grid[row][col].value;
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    }

    main();
  });

  return (
    <>
      <canvas
        className={styles["game-canvas"]}
        width="600"
        height="650"
      ></canvas>
      <Script></Script>
    </>
  );
};
