"use client";

import styles from "../styles/TetrisGame.module.css";
import Script from "next/script";
import { useEffect } from "react";

export const TetrisGame = () => {
  useEffect(() => {
    const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

    const keyState = new Map();
    const EMPTY_TETROMINO = -1;
    const CURRENT_TETROMINO = 0;
    const WHILE_LOOP_MAX = 999;
    let whileLoopCounter = 0;
    let holdPiece = EMPTY_TETROMINO;
    let isSwapped = false;
    const QUEUE_SIZE = 5;
    const piecesQueue: number[] = [];
    for (let i = 0; i <= QUEUE_SIZE; i++) {
      piecesQueue.push(randomPiece());
    }

    const BOARD_WIDTH = 10;
    const BOARD_HEIGHT = 20;
    const BOARD_BUFFER_HEIGHT = 4;
    const TILE_SIZE = 25;
    const BOARD_PADDING = {
      left: canvas.width / 2 - (TILE_SIZE * BOARD_WIDTH) / 2,
      top: canvas.height / 10,
    };

    const PIECES: any = {
      1: {
        color: "aqua",
        patterns: {
          0: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
          ],
          1: [
            { x: 2, y: 0 },
            { x: 2, y: 1 },
            { x: 2, y: 2 },
            { x: 2, y: 3 },
          ],
          2: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
          ],
          3: [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
          ],
        },
      },
      2: {
        color: "blue",
        patterns: {
          0: [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
          ],
          1: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
          ],
          2: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 2, y: 1 },
          ],
          3: [
            { x: 2, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 1 },
            { x: 2, y: 0 },
          ],
        },
      },
      3: {
        color: "orange",
        patterns: {
          0: [
            { x: 2, y: 0 },
            { x: 2, y: 1 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
          ],
          1: [
            { x: 1, y: -1 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
          ],
          2: [
            { x: 0, y: 1 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
          ],
          3: [
            { x: 0, y: -1 },
            { x: 1, y: -1 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
          ],
        },
      },
      4: {
        color: "yellow",
        patterns: {
          0: [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 0 },
            { x: 2, y: 1 },
          ],
          1: [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 0 },
            { x: 2, y: 1 },
          ],
          2: [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 0 },
            { x: 2, y: 1 },
          ],
          3: [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 0 },
            { x: 2, y: 1 },
          ],
        },
      },
      5: {
        color: "green",
        patterns: {
          0: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
          ],
          1: [
            { x: 1, y: -1 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 2, y: 1 },
          ],
          2: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
          ],
          3: [
            { x: 0, y: -1 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
          ],
        },
      },
      6: {
        color: "purple",
        patterns: {
          0: [
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 1, y: 0 },
          ],
          1: [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 1, y: 2 },
          ],
          2: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 1, y: 1 },
          ],
          3: [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
            { x: 1, y: 2 },
          ],
        },
      },
      7: {
        color: "red",
        patterns: {
          0: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
          ],
          1: [
            { x: 2, y: -1 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 1, y: 1 },
          ],
          2: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
          ],
          3: [
            { x: 1, y: -1 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
          ],
        },
      },
    };

    function getBottomTiles(pattern: Array<{ x: number; y: number }>) {
      let tileMap: Map<Number, { x: number; y: number }> = new Map();
      for (let i = 0; i < pattern.length; i++) {
        const tile = pattern[i];
        if (!tileMap.get(tile.x)) {
          tileMap.set(tile.x, tile);
        } else if (tile.y > tileMap.get(tile.x)!.y) {
          tileMap.set(tile.x, tile);
        }
      }
      return Array.from(tileMap.values());
    }

    function getLeftTiles(pattern: Array<{ x: number; y: number }>) {
      let tileMap: Map<Number, { x: number; y: number }> = new Map();
      for (let i = 0; i < pattern.length; i++) {
        const tile = pattern[i];
        if (!tileMap.get(tile.y)) {
          tileMap.set(tile.y, tile);
        } else if (tile.x < tileMap.get(tile.y)!.x) {
          tileMap.set(tile.y, tile);
        }
      }
      return Array.from(tileMap.values());
    }

    function getRightTiles(pattern: Array<{ x: number; y: number }>) {
      let tileMap: Map<Number, { x: number; y: number }> = new Map();
      for (let i = 0; i < pattern.length; i++) {
        const tile = pattern[i];
        if (!tileMap.get(tile.y)) {
          tileMap.set(tile.y, tile);
        } else if (tile.x > tileMap.get(tile.y)!.x) {
          tileMap.set(tile.y, tile);
        }
      }
      return Array.from(tileMap.values());
    }

    function randomPiece() {
      return Math.floor(Math.random() * 7) + 1;
    }

    function newPiece(): {
      position: { x: number; y: number };
      piece: number;
      rotation: number;
    } {
      return {
        position: { x: ((BOARD_WIDTH - 4) / 2) | 0, y: 0 },
        piece: piecesQueue.shift() ?? randomPiece(),
        rotation: 0,
      };
    }

    let currentPiece: {
      position: { x: number; y: number };
      piece: number;
      rotation: number;
    } = newPiece();

    const board: Array<Array<number>> = [];
    for (let i = 0; i < BOARD_HEIGHT + BOARD_BUFFER_HEIGHT; i++) {
      board.push(Array(BOARD_WIDTH).fill(EMPTY_TETROMINO));
    }
    let backgroundColor = "black";
    let tileFillColor = "black";
    let tileStrokeColor = "#555555";

    function draw() {
      // Background
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = backgroundColor;
      ctx.fill();
      ctx.closePath();

      // Hold
      if (holdPiece != EMPTY_TETROMINO) {
        const pattern = getPattern(holdPiece, 0);
        for (let i = 0; i < pattern.length; i++) {
          const tile = pattern[i];
          const x = tile.x * TILE_SIZE + BOARD_PADDING.left * 0.25;
          const y = (4 + tile.y) * TILE_SIZE + BOARD_PADDING.top;
          ctx.beginPath();
          ctx.rect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = PIECES[holdPiece].color;
          ctx.strokeStyle = PIECES[holdPiece].color;
          ctx.lineWidth = 1.3;
          ctx.fill();
          ctx.stroke();
          ctx.closePath();
        }
      }

      // Queue
      for (let i = piecesQueue.length - 1; i >= 0; i--) {
        const pattern = getPattern(piecesQueue[i], 0);
        for (let j = 0; j < pattern.length; j++) {
          const tile = pattern[j];
          const x =
            (BOARD_WIDTH + tile.x) * TILE_SIZE + BOARD_PADDING.left * 1.25;
          const y = (4 * i + tile.y) * TILE_SIZE + BOARD_PADDING.top;
          ctx.beginPath();
          ctx.rect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = PIECES[piecesQueue[i]].color;
          ctx.strokeStyle = PIECES[piecesQueue[i]].color;
          ctx.lineWidth = 1.3;
          ctx.fill();
          ctx.stroke();
          ctx.closePath();
        }
      }

      // Grid
      for (let i = 0; i < BOARD_HEIGHT + BOARD_BUFFER_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
          ctx.beginPath();
          ctx.rect(
            j * TILE_SIZE + BOARD_PADDING.left,
            i * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
          );
          if (getBoard(j, i) == EMPTY_TETROMINO) {
            if (i < BOARD_BUFFER_HEIGHT) {
              ctx.fillStyle = "black";
              ctx.strokeStyle = "black";
            } else {
              ctx.fillStyle = tileFillColor;
              ctx.strokeStyle = tileStrokeColor;
            }
            ctx.stroke();
          } else if (getBoard(j, i) == CURRENT_TETROMINO) {
            ctx.fillStyle = PIECES[currentPiece.piece].color;
          } else {
            ctx.fillStyle = PIECES[board[i][j]].color;
          }
          ctx.fill();
          ctx.closePath();
        }
      }
    }

    function setCurrentPiece(
      value: number = CURRENT_TETROMINO,
      ignoreOccupied: boolean = false
    ) {
      moveOutTheWay();
      const pattern = getCurrentPattern();

      for (let i = 0; i < pattern.length; i++) {
        const tile = pattern[i];
        let y = currentPiece.position.y + tile.y;
        let x = currentPiece.position.x + tile.x;
        setBoard(x, y, value, ignoreOccupied);
      }
    }

    function resetCurrentPiece() {
      setCurrentPiece(EMPTY_TETROMINO, true);
    }

    function move(direction: string) {
      resetCurrentPiece();

      switch (direction) {
        case "left":
          !leftTilesCollide(1) && currentPiece.position.x--;
          break;
        case "right":
          !rightTilesCollide(1) && currentPiece.position.x++;
          break;
        case "down":
          !bottomTilesCollide(1) && currentPiece.position.y++;
          break;
        case "up":
          currentPiece.position.y--;
          break;
      }

      setCurrentPiece();
    }

    function incrementWhileLoopCounter() {
      whileLoopCounter++;
      if (whileLoopCounter >= WHILE_LOOP_MAX) {
        throw Error("While loop maximum exceeded.");
      }
    }

    function moveOutTheWay() {
      const pattern = getCurrentPattern();

      while (
        (isInvalidCurrentPiece() || isOccupiedCurrentPiece()) &&
        whileLoopCounter < WHILE_LOOP_MAX
      ) {
        incrementWhileLoopCounter();
        for (let i = 0; i < pattern.length; i++) {
          const tile = pattern[i];
          let x = currentPiece.position.x + tile.x;
          let y = currentPiece.position.y + tile.y;

          while (
            (isInvalidLowY(y) ||
              (!isInvalid(x, y + 1) && isOccupied(x, y + 1))) &&
            whileLoopCounter < WHILE_LOOP_MAX
          ) {
            incrementWhileLoopCounter();
            currentPiece.position.y--;
            y = currentPiece.position.y + tile.y;
          }

          while (
            (isInvalidHighY(y) ||
              (!isInvalid(x, y - 1) && isOccupied(x, y - 1))) &&
            whileLoopCounter < WHILE_LOOP_MAX
          ) {
            incrementWhileLoopCounter();
            currentPiece.position.y++;
            y = currentPiece.position.y + tile.y;
          }

          while (
            (isInvalidHighX(x) ||
              (!isInvalid(x + 1, y) && isOccupied(x + 1, y))) &&
            whileLoopCounter < WHILE_LOOP_MAX
          ) {
            incrementWhileLoopCounter();
            currentPiece.position.x--;
            x = currentPiece.position.x + tile.x;
          }

          while (
            (isInvalidLowX(x) ||
              (!isInvalid(x - 1, y) && isOccupied(x - 1, y))) &&
            whileLoopCounter < WHILE_LOOP_MAX
          ) {
            incrementWhileLoopCounter();
            currentPiece.position.x++;
            x = currentPiece.position.x + tile.x;
          }
        }
      }
      whileLoopCounter = 0;
    }

    function rotate(degrees: number) {
      resetCurrentPiece();

      currentPiece.rotation += degrees;

      if (currentPiece.rotation < 0) {
        currentPiece.rotation += 4;
      }

      currentPiece.rotation %= 4;

      setCurrentPiece();
    }

    function getPattern(piece: number, rotation: number) {
      return PIECES[piece].patterns[rotation];
    }

    function getCurrentPattern() {
      return PIECES[currentPiece.piece].patterns[currentPiece.rotation];
    }

    function bottomTilesCollide(n: number) {
      const bottomTiles = getBottomTiles(getCurrentPattern());

      for (let i = 0; i < bottomTiles.length; i++) {
        const x = currentPiece.position.x + bottomTiles[i].x;
        const y = currentPiece.position.y + bottomTiles[i].y + n;
        if (detectCollision(x, y)) {
          return true;
        }
      }
      return false;
    }

    function leftTilesCollide(n: number) {
      const leftTiles = getLeftTiles(getCurrentPattern());

      for (let i = 0; i < leftTiles.length; i++) {
        const x = currentPiece.position.x + leftTiles[i].x - n;
        const y = currentPiece.position.y + leftTiles[i].y;
        if (detectCollision(x, y)) {
          return true;
        }
      }
      return false;
    }

    function rightTilesCollide(n: number) {
      const rightTiles = getRightTiles(getCurrentPattern());

      for (let i = 0; i < rightTiles.length; i++) {
        const x = currentPiece.position.x + rightTiles[i].x + n;
        const y = currentPiece.position.y + rightTiles[i].y;
        if (detectCollision(x, y)) {
          return true;
        }
      }
      return false;
    }

    function isNotEmpty(x: number, y: number) {
      return !isInvalid(x, y) && board[y][x] != EMPTY_TETROMINO;
    }

    function detectCollision(x: number, y: number) {
      if (isInvalid(x, y) || isNotEmpty(x, y)) {
        return true;
      }
      return false;
    }

    window.addEventListener("keydown", (e) => {
      keyState.set(e.key, true);
    });

    window.addEventListener("keyup", (e) => {
      keyState.set(e.key, false);
    });

    function isInvalidLowX(x: number) {
      return x < 0;
    }

    function isInvalidHighX(x: number) {
      return x >= BOARD_WIDTH;
    }

    function isInvalidX(x: number) {
      return isInvalidLowX(x) || isInvalidHighX(x);
    }

    function isInvalidLowY(y: number) {
      return y >= BOARD_HEIGHT + BOARD_BUFFER_HEIGHT;
    }

    function isInvalidHighY(y: number) {
      return y < 0;
    }

    function isInvalidY(y: number) {
      return isInvalidLowY(y) || isInvalidHighY(y);
    }

    function isInvalid(x: number, y: number) {
      return isInvalidX(x) || isInvalidY(y);
    }

    function isInvalidCurrentPiece() {
      const pattern = getCurrentPattern();
      for (let i = 0; i < pattern.length; i++) {
        const tile = pattern[i];
        const x = currentPiece.position.x + tile.x;
        const y = currentPiece.position.y + tile.y;
        if (isInvalid(x, y)) {
          return true;
        }
      }
      return false;
    }

    function isOccupiedCurrentPiece() {
      const pattern = getCurrentPattern();
      for (let i = 0; i < pattern.length; i++) {
        const tile = pattern[i];
        const x = currentPiece.position.x + tile.x;
        const y = currentPiece.position.y + tile.y;
        if (isOccupied(x, y)) {
          return true;
        }
      }
      return false;
    }

    function isOccupied(x: number, y: number) {
      return (
        getBoard(x, y) != EMPTY_TETROMINO && getBoard(x, y) != CURRENT_TETROMINO
      );
    }

    function getBoard(x: number, y: number) {
      if (isInvalid(x, y)) {
        throw Error(`Invalid position (${x},${y}).`);
      }

      return board[y][x];
    }

    function setBoard(
      x: number,
      y: number,
      value: number,
      ignoreOccupied: boolean = false
    ) {
      if (isInvalid(x, y)) {
        throw Error(`Invalid position (${x},${y})`);
      }
      if (!ignoreOccupied && isOccupied(x, y)) {
        throw Error(`Already occupied (${x}, ${y})`);
      }

      board[y][x] = value;
    }

    function resetBoard() {
      for (let i = 0; i < BOARD_HEIGHT + BOARD_BUFFER_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
          setBoard(j, i, EMPTY_TETROMINO, true);
        }
      }
    }

    function clearLine(r: number) {
      for (let i = 0; i < BOARD_WIDTH; i++) {
        setBoard(i, r, EMPTY_TETROMINO, true);
      }
      for (let i = r; i > 0; i--) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
          setBoard(j, i, getBoard(j, i - 1), true);
        }
      }
    }

    function clearLines() {
      for (let i = 0; i < BOARD_HEIGHT + BOARD_BUFFER_HEIGHT; i++) {
        let isFull = true;
        for (let j = 0; j < BOARD_WIDTH; j++) {
          if (getBoard(j, i) == EMPTY_TETROMINO) {
            isFull = false;
            break;
          }
        }
        if (isFull) {
          clearLine(i);
        }
      }
    }

    let timer = 0;
    let rotationTimer = 0;
    let collisionTimer = 0;
    function gameLoop() {
      requestAnimationFrame(gameLoop);

      if (timer > 0) {
        timer--;
      }
      if (rotationTimer > 0) {
        rotationTimer--;
      }
      if (collisionTimer > 0) {
        collisionTimer--;
      }
      if (keyState.get("c") && !isSwapped) {
        timer = 10;
        resetCurrentPiece();
        if (holdPiece == EMPTY_TETROMINO) {
          holdPiece = currentPiece.piece;
          currentPiece = newPiece();
          piecesQueue.push(randomPiece());
          setCurrentPiece();
        } else {
          [holdPiece, currentPiece.piece] = [currentPiece.piece, holdPiece];
        }
        isSwapped = true;
      }
      if (keyState.get("ArrowLeft") && timer == 0) {
        timer = 5;
        collisionTimer = 15;
        move("left");
      }
      if (keyState.get("ArrowRight") && timer == 0) {
        timer = 5;
        collisionTimer = 15;
        move("right");
      }
      if (keyState.get("ArrowDown") && timer == 0) {
        timer = 5;
        collisionTimer = 15;
        move("down");
      }
      if (keyState.get("ArrowUp") && rotationTimer == 0) {
        rotationTimer = 15;
        collisionTimer = 15;
        rotate(1);
      }
      if (keyState.get("z") && rotationTimer == 0) {
        rotationTimer = 15;
        collisionTimer = 15;
        rotate(-1);
      }
      if (keyState.get(" ") && timer == 0) {
        timer = 10;
        while (!bottomTilesCollide(1) && whileLoopCounter < WHILE_LOOP_MAX) {
          incrementWhileLoopCounter();
          move("down");
        }
        whileLoopCounter = 0;
      }

      if (bottomTilesCollide(1)) {
        if (currentPiece.position.y < BOARD_BUFFER_HEIGHT) {
          resetBoard();
        }

        if (collisionTimer == 0) {
          collisionTimer = 15;
        }

        if (collisionTimer < 5) {
          resetCurrentPiece();
          setCurrentPiece(currentPiece.piece);
          currentPiece = newPiece();
          piecesQueue.push(randomPiece());
          clearLines();
          setCurrentPiece();
          isSwapped = false;
        }
      }
      draw();
    }

    setInterval(() => {
      move("down");
    }, 1000);

    setCurrentPiece();
    gameLoop();
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
