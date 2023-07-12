"use client";

import styles from "../styles/TetrisGame.module.css";
import Script from "next/script";
import { useEffect } from "react";

export const TetrisGame = () => {
  useEffect(() => {
    const CANVAS: HTMLCanvasElement = document.querySelector("canvas")!;

    const KEY_STATE = new Map();
    const GRID_WIDTH = 10;
    const GRID_HEIGHT = 20;
    const GRID_BUFFER_HEIGHT = 4;
    const TETROMINO_MAX_SIZE = 4;
    const TILE_SIZE = 25;
    const GRID_X = CANVAS.width / 2 - (TILE_SIZE * GRID_WIDTH) / 2;
    const GRID_Y = 0;
    const GRID_BACKGROUND_COLOR = "gray";

    const STRAIGHT_TILES = [
      false,
      false,
      false,
      false,
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];

    const SQUARE_TILES = [
      false,
      true,
      true,
      false,
      false,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];

    const T_TILES = [
      false,
      true,
      false,
      false,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];

    const L_TILES = [
      false,
      false,
      true,
      false,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];

    const J_TILES = [
      true,
      false,
      false,
      false,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];

    const S_TILES = [
      false,
      true,
      true,
      false,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];

    const Z_TILES = [
      true,
      true,
      false,
      false,
      false,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];

    interface GameParams {
      canvas: HTMLCanvasElement;
    }

    class Game {
      private _canvas: HTMLCanvasElement;
      private _context: CanvasRenderingContext2D;
      private _grid: Grid;
      private _gridBackground: GridBackground;
      private _currentTetromino: Tetromino;

      constructor({ canvas }: GameParams) {
        this._canvas = canvas;
        this._context = canvas.getContext("2d")!;

        this._grid = new Grid({
          x: GRID_X,
          y: GRID_Y,
          width: GRID_WIDTH,
          height: GRID_HEIGHT,
          bufferHeight: GRID_BUFFER_HEIGHT,
          tileSize: TILE_SIZE,
        });

        this._gridBackground = new GridBackground({
          grid: this._grid,
          color: GRID_BACKGROUND_COLOR,
        });

        this._currentTetromino = this.randomTetromino();
      }

      randomTetromino() {
        let randomTiles: Array<boolean>;
        const randomValue = Math.floor(Math.random() * 7 + 2);
        switch (randomValue) {
          case 2:
            randomTiles = STRAIGHT_TILES;
            break;
          case 3:
            randomTiles = SQUARE_TILES;
            break;
          case 4:
            randomTiles = T_TILES;
            break;
          case 5:
            randomTiles = L_TILES;
            break;
          case 6:
            randomTiles = J_TILES;
            break;
          case 7:
            randomTiles = S_TILES;
            break;
          default:
            randomTiles = Z_TILES;
            break;
        }

        return new Tetromino({
          position: 3,
          value: randomValue,
          tiles: randomTiles,
        });
      }

      place() {
        const numTiles = this._currentTetromino.tiles.length;
        const position = this._currentTetromino.index;

        for (let i = 0; i < numTiles; i++) {
          if (this._currentTetromino.tiles[i]) {
            const row = this._grid.width * Math.floor(i / TETROMINO_MAX_SIZE);
            const col = i % TETROMINO_MAX_SIZE;
            const index = col + row + position;
            this._grid.setValue(index, this._currentTetromino.value);
          }
        }
      }

      clear() {
        const numTiles = this._currentTetromino.tiles.length;
        const position = this._currentTetromino.index;

        for (let i = 0; i < numTiles; i++) {
          if (this._currentTetromino.tiles[i]) {
            const row = this._grid.width * Math.floor(i / TETROMINO_MAX_SIZE);
            const col = i % TETROMINO_MAX_SIZE;
            const index = col + row + position;
            this._grid.setValue(index, GridValue.EMPTY);
          }
        }
      }

      start() {
        const gridBackground = this._gridBackground;
        const grid = this._grid;
        const canvas = this._canvas;
        const ctx = this._context;

        function draw() {
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          gridBackground.draw(ctx);
          grid.draw(ctx, true);
          requestAnimationFrame(draw);
        }

        this.place();
        draw();

        setInterval(() => {
          this.clear();
          this._currentTetromino.index += this._grid.width;
          this._currentTetromino.index %= this._grid.size;
          this.place();
        }, 1000);
      }
    }

    enum GridValue {
      EMPTY,
      CURRENT,
      STRAIGHT,
      SQUARE,
      T,
      L,
      J,
      S,
      Z,
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
      private _grid: Array<GridValue>;

      public get grid(): Array<GridValue> {
        return this._grid;
      }

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

      public get size(): number {
        return this.width * this.totalHeight;
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

      public getValue(index: number) {
        return this._grid[index];
      }

      public setValue(index: number, value: GridValue) {
        this._grid[index] = value;
      }

      getColor(value: GridValue) {
        switch (value) {
          case GridValue.EMPTY:
            return "#000000aa";
          case GridValue.STRAIGHT:
            return "cyan";
          case GridValue.SQUARE:
            return "yellow";
          case GridValue.T:
            return "purple";
          case GridValue.L:
            return "orange";
          case GridValue.J:
            return "blue";
          case GridValue.S:
            return "green";
          case GridValue.Z:
            return "red";
          default:
            return "magenta";
        }
      }

      public draw(ctx: CanvasRenderingContext2D, showIndices: boolean = false) {
        for (let i = 0; i < this.size; i++) {
          const row = Math.floor(i / this.width);
          const col = i % this.width;
          const x = col * this.tileSize + this.x;
          const y = row * this.tileSize + this.y;
          const value = this.getValue(col + row * this.width);
          ctx.beginPath();
          ctx.rect(x, y, this.tileSize, this.tileSize);
          ctx.fillStyle = this.getColor(value);
          ctx.fill();

          if (showIndices) {
            ctx.fillStyle = "white";
            ctx.fillText(
              `${i}`,
              x + (1 * this.tileSize) / 5,
              y + (2 * this.tileSize) / 3
            );
          }

          ctx.closePath();
        }
      }

      private initializeGrid() {
        for (let i = 0; i < this.size; i++) {
          this._grid.push(GridValue.EMPTY);
        }
      }
    }

    interface TetrominoParams {
      position: number;
      value: GridValue;
      tiles: Array<boolean>;
    }

    class Tetromino {
      private _index: number;
      private _value: GridValue;
      private _tiles: Array<boolean>;

      public get index(): number {
        return this._index;
      }

      public get value(): GridValue {
        return this._value;
      }

      public get tiles(): Array<boolean> {
        return this._tiles;
      }

      public set index(index: number) {
        this._index = index;
      }

      constructor({ position, value, tiles }: TetrominoParams) {
        this._index = position;
        this._value = value;
        this._tiles = tiles;
      }
    }

    const game = new Game({ canvas: CANVAS });
    game.start();
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
