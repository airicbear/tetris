"use client";

import styles from "../styles/TetrisGame.module.css";
import Script from "next/script";
import { useEffect } from "react";

export const TetrisGame = () => {
  useEffect(() => {
    const CANVAS: HTMLCanvasElement = document.querySelector("canvas")!;

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
      false,
      false,
      false,
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

    const ROTATION_PIVOT = 5;

    interface GameParams {
      canvas: HTMLCanvasElement;
    }

    class Game {
      private _canvas: HTMLCanvasElement;
      private _context: CanvasRenderingContext2D;
      private _grid: Grid;
      private _gridBackground: GridBackground;
      private _currentTetromino: Tetromino;
      private _keyState: Map<string, boolean>;
      private _queue: TetrominoQueue;
      private _hold: Tetromino | undefined;
      private _swapped: boolean;

      constructor({ canvas }: GameParams) {
        this._canvas = canvas;
        this._context = canvas.getContext("2d")!;
        this._keyState = new Map();
        this._swapped = false;

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

        this._queue = new TetrominoQueue(5);
        this._currentTetromino = this._queue.next!;
      }

      getEmptyIndex(value: GridValue) {
        switch (value) {
          case GridValue.S:
          case GridValue.Z:
            return 0;
          case GridValue.SQUARE:
          case GridValue.T:
          case GridValue.J:
          case GridValue.L:
            return 0;
          default:
            return 0;
        }
      }

      isCollidingLeftRotation() {
        this.clear();
        const numTiles = this._currentTetromino.tiles.length;
        let rotated;

        if (this._currentTetromino.value == GridValue.STRAIGHT) {
          rotated = this.lRotate4x4(this._currentTetromino.tiles);
        } else {
          rotated = this.rotateMatrix(
            this._currentTetromino.tiles,
            ROTATION_PIVOT
          );
        }

        for (let i = 0; i < numTiles; i++) {
          const index = this.mapTileToGrid(i);
          const occupied = this._grid.getValue(index) != GridValue.EMPTY;
          if (rotated[i] && occupied) {
            this.place();
            return true;
          }
        }

        this.place();
        return false;
      }

      isCollidingRightRotation() {
        this.clear();
        const numTiles = this._currentTetromino.tiles.length;
        let rotated;

        if (this._currentTetromino.value == GridValue.STRAIGHT) {
          rotated = this.lRotate4x4(this._currentTetromino.tiles);
        } else {
          rotated = this.rotateMatrix(
            this._currentTetromino.tiles,
            ROTATION_PIVOT
          );
        }

        for (let i = 0; i < numTiles; i++) {
          const index = this.mapTileToGrid(i);
          const outOfBounds =
            this._currentTetromino.index % this._grid.width >
              this._grid.width - TETROMINO_MAX_SIZE ||
            this._currentTetromino.index < 0;
          const occupied = this._grid.getValue(index) != GridValue.EMPTY;
          if (rotated[i] && (outOfBounds || occupied)) {
            this._context.fillText(`${index}`, 10, (i + 2) * 10);
            this.place();
            return true;
          }
        }

        this.place();
        return false;
      }

      isCollidingMoveDown() {
        this.clear();
        const numTiles = this._currentTetromino.tiles.length;

        for (let i = 0; i < numTiles; i++) {
          const index = this.mapTileToGrid(i);
          const occupied =
            this._grid.getValue(index + this._grid.width) != GridValue.EMPTY;
          if (this._currentTetromino.tiles[i] && occupied) {
            this.place();
            return true;
          }
        }

        this.place();
        return false;
      }

      isCollidingMoveLeft() {
        this.clear();
        const numTiles = this._currentTetromino.tiles.length;

        for (let i = 0; i < numTiles; i++) {
          const index = this.mapTileToGrid(i);
          const outOfBounds = (index % this._grid.width) - 1 < 0;
          const occupied = this._grid.getValue(index - 1) != GridValue.EMPTY;
          if (this._currentTetromino.tiles[i] && (outOfBounds || occupied)) {
            this.place();
            return true;
          }
        }

        this.place();
        return false;
      }

      isCollidingMoveRight() {
        this.clear();
        const numTiles = this._currentTetromino.tiles.length;

        for (let i = 0; i < numTiles; i++) {
          const index = this.mapTileToGrid(i);
          const outOfBounds =
            (index % this._grid.width) + 1 >= this._grid.width;
          const occupied = this._grid.getValue(index + 1) != GridValue.EMPTY;
          if (this._currentTetromino.tiles[i] && (outOfBounds || occupied)) {
            this.place();
            return true;
          }
        }

        this.place();
        return false;
      }

      lRotate4x4(matrix: Array<boolean>): Array<boolean> {
        const result: Array<boolean> = [];

        for (let i = 3; i >= 0; i--) {
          for (let j = 0; j < 4; j++) {
            result.push(matrix[j * 4 + i]);
          }
        }

        return result;
      }

      rRotate4x4(tiles: Array<boolean>) {
        const result: boolean[] = [];

        for (let i = 0; i < 4; i++) {
          for (let j = 3; j >= 0; j--) {
            result.push(tiles[j * 4 + i]);
          }
        }

        return result;
      }

      rotateMatrix(matrix: boolean[], pivotIndex: number): boolean[] {
        const size = Math.sqrt(matrix.length);
        const pivotRow = Math.floor(pivotIndex / size);
        const pivotCol = pivotIndex % size;
        const newMatrix = new Array<boolean>(matrix.length);
        for (let i = 0; i < matrix.length; i++) {
          const row = Math.floor(i / size);
          const col = i % size;
          const newRow = pivotRow + (col - pivotCol);
          const newCol = pivotCol - (row - pivotRow);
          const newIndex = newRow * size + newCol;
          newMatrix[newIndex] = matrix[i];
        }
        return newMatrix;
      }

      mapTileToGrid(i: number) {
        const position = this._currentTetromino.index;
        const row = this._grid.width * Math.floor(i / TETROMINO_MAX_SIZE);
        const col = i % TETROMINO_MAX_SIZE;
        return row + col + position;
      }

      place() {
        const numTiles = this._currentTetromino.tiles.length;

        for (let i = 0; i < numTiles; i++) {
          if (this._currentTetromino.tiles[i]) {
            this._grid.setValue(
              this.mapTileToGrid(i),
              this._currentTetromino.value
            );
          }
        }
      }

      clear() {
        const numTiles = this._currentTetromino.tiles.length;

        for (let i = 0; i < numTiles; i++) {
          if (this._currentTetromino.tiles[i]) {
            this._grid.setValue(this.mapTileToGrid(i), GridValue.EMPTY);
          }
        }
      }

      drawValues() {
        this._context.beginPath();
        this._context.fillStyle = "white";

        let count = 1;
        for (let i = 0; i < 16; i++) {
          if (this._currentTetromino.tiles[i]) {
            this._context.fillText(`i = ${i}`, 50, 50 + count * 25);
            count++;
          }
        }

        this._context.fillText(
          `position = ${this._currentTetromino.index}`,
          10,
          50 + (count + 1) * 25
        );
        this._context.fillText(
          `isCollidingMoveDown = ${this.isCollidingMoveDown()}`,
          10,
          50 + (count + 2) * 25
        );
        this._context.fillText(
          `isCollidingMoveLeft = ${this.isCollidingMoveLeft()}`,
          10,
          50 + (count + 3) * 25
        );
        this._context.fillText(
          `isCollidingMoveRight = ${this.isCollidingMoveRight()}`,
          10,
          50 + (count + 4) * 25
        );
        this._context.fillText(
          `isCollidingRightRotation = ${this.isCollidingRightRotation()}`,
          10,
          50 + (count + 5) * 25
        );

        this._context.closePath();
      }

      draw(showValues: boolean = false) {
        this._context.fillStyle = "black";
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
        this._gridBackground.draw(this._context);
        this._grid.draw(this._context);
        this._queue.draw(
          this._context,
          this._grid.x +
            this._grid.width * this._grid.tileSize +
            this._grid.tileSize,
          this._grid.tileSize,
          this._grid.tileSize,
          TETROMINO_MAX_SIZE
        );

        if (this._hold) {
          this._hold.draw(
            this._context,
            this._grid.x -
              this._grid.tileSize * TETROMINO_MAX_SIZE -
              this._grid.tileSize,
            this._grid.tileSize,
            this._grid.tileSize,
            TETROMINO_MAX_SIZE
          );
        }

        if (showValues) {
          this.drawValues();
        }
      }

      setup() {
        window.addEventListener("keydown", (e) => {
          this._keyState.set(e.key, true);
        });

        window.addEventListener("keyup", (e) => {
          this._keyState.set(e.key, false);
        });

        this.place();
      }

      moveDown() {
        this.clear();
        this._currentTetromino.index += this._grid.width;
        this._currentTetromino.index %= this._grid.size;
        this.place();
      }

      moveLeft() {
        this.clear();
        this._currentTetromino.index--;
        this._currentTetromino.index %= this._grid.size;
        this.place();
      }

      moveRight() {
        this.clear();
        this._currentTetromino.index++;
        this._currentTetromino.index %= this._grid.size;
        this.place();
      }

      autoMoveDown(tick: number, limit: number) {
        if (tick <= 0 && !this.isCollidingMoveDown()) {
          this.moveDown();
          return limit;
        } else if (this.isCollidingMoveDown()) {
          if (this._currentTetromino.index < this._grid.totalHeight) {
            this.reset();
          }

          this._currentTetromino = this._queue.next!;
          this._swapped = false;
        }
        return tick;
      }

      rotateLeft() {
        this.clear();
        if (this._currentTetromino.value == GridValue.STRAIGHT) {
          this._currentTetromino.tiles = this.rRotate4x4(
            this._currentTetromino.tiles
          );
        } else if (this._currentTetromino.value != GridValue.SQUARE) {
          this._currentTetromino.tiles = this.rotateMatrix(
            this._currentTetromino.tiles,
            ROTATION_PIVOT
          );
        }
        this.place();
      }

      rotateRight() {
        this.clear();
        if (this._currentTetromino.value == GridValue.STRAIGHT) {
          this._currentTetromino.tiles = this.rRotate4x4(
            this._currentTetromino.tiles
          );
        } else if (this._currentTetromino.value != GridValue.SQUARE) {
          this._currentTetromino.tiles = this.rotateMatrix(
            this._currentTetromino.tiles,
            ROTATION_PIVOT
          );
        }
        this.place();
      }

      handleInput(tick: number, limit: number) {
        if (tick <= 0) {
          if (this._keyState.get("z") && !this.isCollidingLeftRotation()) {
            this.rotateLeft();
            return limit * 2.5;
          }
          if (this._keyState.get("c") && !this._swapped) {
            this._swapped = true;

            this.clear();
            if (this._hold == undefined) {
              this._hold = this._currentTetromino;
              this._currentTetromino = this._queue.next!;
            } else {
              const temp = this._currentTetromino;
              this._currentTetromino = this._hold;
              this._hold = temp;
            }
            this._currentTetromino.index = 0;
            this.place();
          }
          if (
            this._keyState.get("ArrowUp") &&
            !this.isCollidingRightRotation()
          ) {
            this.rotateRight();
            return limit * 2.5;
          }
          if (this._keyState.get(" ")) {
            while (!this.isCollidingMoveDown()) {
              this.moveDown();
            }
            return limit * 2.5;
          }
          if (this._keyState.get("ArrowDown") && !this.isCollidingMoveDown()) {
            this.moveDown();
            return limit;
          }
          if (this._keyState.get("ArrowLeft") && !this.isCollidingMoveLeft()) {
            this.moveLeft();
            return limit;
          }
          if (
            this._keyState.get("ArrowRight") &&
            !this.isCollidingMoveRight()
          ) {
            this.moveRight();
            return limit;
          }
        }
        return tick;
      }

      clearLine(row: number) {
        for (let i = 0; i < this._grid.width; i++) {
          this._grid.setValue(row * this._grid.width + i, GridValue.EMPTY);
        }
        for (let i = row; i > 0; i--) {
          for (let j = 0; j < this._grid.width; j++) {
            const previousRowValue = this._grid.getValue(
              (i - 1) * this._grid.width + j
            );
            this._grid.setValue(i * this._grid.width + j, previousRowValue);
          }
        }
      }

      isFullRow(row: number) {
        for (let i = 0; i < this._grid.width; i++) {
          if (
            this._grid.getValue(row * this._grid.width + i) == GridValue.EMPTY
          ) {
            return false;
          }
        }
        return true;
      }

      clearLines() {
        let linesCleared = 0;
        for (let row = 0; row < this._grid.totalHeight; row++) {
          if (this.isFullRow(row)) {
            this.clearLine(row);
            linesCleared++;
          }
        }
      }

      reset() {
        for (let i = 0; i < this._grid.totalHeight; i++) {
          this.clearLine(i);
        }
      }

      update() {
        let inputTick = 0;
        let moveDownTick = 0;

        const draw = () => this.draw();
        const handleInput = () => {
          inputTick = this.handleInput(inputTick, 5);
        };
        const autoMoveDown = () => {
          moveDownTick = this.autoMoveDown(moveDownTick, 50);
        };
        const clearLines = () => this.clearLines();

        function loop() {
          if (inputTick > 0) {
            inputTick--;
          }

          if (moveDownTick > 0) {
            moveDownTick--;
          }

          handleInput();
          draw();
          autoMoveDown();
          clearLines();
          requestAnimationFrame(loop);
        }

        loop();
      }

      start() {
        this.setup();
        this.update();
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

    function getColor(value: GridValue) {
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

      public get bufferHeight(): number {
        return this._bufferHeight;
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

      public draw(ctx: CanvasRenderingContext2D, showIndices: boolean = false) {
        for (let i = 0; i < this.size; i++) {
          const row = Math.floor(i / this.width);
          const col = i % this.width;
          const x = col * this.tileSize + this.x;
          const y = row * this.tileSize + this.y;
          const value = this.getValue(col + row * this.width);
          ctx.beginPath();
          ctx.rect(x, y, this.tileSize, this.tileSize);
          ctx.fillStyle = getColor(value);
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
      index: number;
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

      public set tiles(tiles: Array<boolean>) {
        this._tiles = tiles;
      }

      draw(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        tileSize: number,
        maxSize: number
      ) {
        ctx.beginPath();
        ctx.fillStyle = getColor(this.value);

        for (let i = 0; i < this._tiles.length; i++) {
          if (this.tiles[i]) {
            ctx.fillRect(
              x + (i % maxSize) * tileSize,
              y + Math.floor(i / maxSize) * tileSize,
              tileSize,
              tileSize
            );
          }
        }

        ctx.closePath();
      }

      constructor({ index, value, tiles }: TetrominoParams) {
        this._index = index;
        this._value = value;
        this._tiles = tiles;
      }
    }

    class TetrominoQueue {
      private _queue: Tetromino[];

      public get next(): Tetromino | undefined {
        const result = this._queue.shift();

        this._queue.push(this.randomTetromino());

        return result;
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
          index: 0,
          value: randomValue,
          tiles: randomTiles,
        });
      }

      draw(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        tileSize: number,
        maxSize: number
      ) {
        ctx.beginPath();

        for (let i = 0; i < this._queue.length; i++) {
          this._queue[i].draw(
            ctx,
            x,
            y + i * maxSize * tileSize,
            tileSize,
            maxSize
          );
        }

        ctx.closePath();
      }

      constructor(size: number) {
        this._queue = [];
        for (let i = 0; i < size; i++) {
          this._queue.push(this.randomTetromino());
        }
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
