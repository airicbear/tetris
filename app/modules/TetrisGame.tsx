"use client";

import styles from "../styles/TetrisGame.module.css";
import Script from "next/script";
import { useEffect } from "react";

export const TetrisGame = () => {
  useEffect(() => {
    const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

    const keyState = new Map();
    let holdPiece = 0;
    let isSwapped = false;
    const queueSize = 5;
    const piecesQueue: number[] = [];
    for (let i = 0; i <= queueSize; i++) {
      piecesQueue.push(randomPiece());
    }

    const boardWidth = 10;
    const boardHeight = 20;
    const boardBufferHeight = 4;
    const tileSize = 25;
    const boardPadding = {
      left: canvas.width / 2 - (tileSize * boardWidth) / 2,
      top: canvas.height / 10,
    };

    const pieces: any = {
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
        position: { x: ((boardWidth - 4) / 2) | 0, y: 0 },
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
    for (let i = 0; i < boardHeight + boardBufferHeight; i++) {
      board.push(Array(boardWidth).fill(0));
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
      if (holdPiece != 0) {
        const pattern = getPattern(holdPiece, 0);
        for (let i = 0; i < pattern.length; i++) {
          const tile = pattern[i];
          const x = tile.x * tileSize + boardPadding.left * 0.25;
          const y = (4 + tile.y) * tileSize + boardPadding.top;
          ctx.beginPath();
          ctx.rect(x, y, tileSize, tileSize);
          ctx.fillStyle = pieces[holdPiece].color;
          ctx.strokeStyle = pieces[holdPiece].color;
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
          const x = (boardWidth + tile.x) * tileSize + boardPadding.left * 1.25;
          const y = (4 * i + tile.y) * tileSize + boardPadding.top;
          ctx.beginPath();
          ctx.rect(x, y, tileSize, tileSize);
          ctx.fillStyle = pieces[piecesQueue[i]].color;
          ctx.strokeStyle = pieces[piecesQueue[i]].color;
          ctx.lineWidth = 1.3;
          ctx.fill();
          ctx.stroke();
          ctx.closePath();
        }
      }

      // Grid
      for (let i = 0; i < boardHeight + boardBufferHeight; i++) {
        for (let j = 0; j < boardWidth; j++) {
          ctx.beginPath();
          ctx.rect(
            j * tileSize + boardPadding.left,
            i * tileSize,
            tileSize,
            tileSize
          );
          if (getBoard(j, i) == 0) {
            if (i < boardBufferHeight) {
              ctx.fillStyle = "black";
              ctx.strokeStyle = "black";
            } else {
              ctx.fillStyle = tileFillColor;
              ctx.strokeStyle = tileStrokeColor;
            }
            ctx.stroke();
          } else {
            ctx.fillStyle = pieces[board[i][j]].color;
          }
          ctx.fill();
          ctx.closePath();
        }
      }
    }

    function setCurrentPiece() {
      const pattern = getCurrentPattern();

      for (let i = 0; i < pattern.length; i++) {
        const y = currentPiece.position.y + pattern[i].y;
        const x = currentPiece.position.x + pattern[i].x;
        setBoard(x, y, currentPiece.piece);
      }
    }

    function resetCurrentPiece() {
      const pattern = getCurrentPattern();

      for (let i = 0; i < pattern.length; i++) {
        const tile = pattern[i];
        const y = currentPiece.position.y + tile.y;
        const x = currentPiece.position.x + tile.x;
        setBoard(x, y, 0);
      }
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

    function moveOutTheWay(tile: { x: number; y: number }) {
      let x = currentPiece.position.x + tile.x;
      let y = currentPiece.position.y + tile.y;
      while (isInvalidHighY(y)) {
        currentPiece.position.y++;
        y = currentPiece.position.y + tile.y;
      }
      while (isInvalidLowY(y)) {
        currentPiece.position.y--;
        y = currentPiece.position.y + tile.y;
      }
      while (isInvalidLowX(x)) {
        currentPiece.position.x++;
        x = currentPiece.position.x + tile.x;
      }
      while (isInvalidHighX(x)) {
        currentPiece.position.x--;
        x = currentPiece.position.x + tile.x;
      }
      while (isNotEmpty(x, y)) {
        currentPiece.position.y--;
        y = currentPiece.position.y + tile.y;
      }
      while (isOccupied(x, y)) {
        currentPiece.position.y--;
        y = currentPiece.position.y + tile.y;
      }
    }

    function rotate(degrees: number) {
      resetCurrentPiece();

      currentPiece.rotation += degrees;

      if (currentPiece.rotation < 0) {
        currentPiece.rotation += 4;
      }

      currentPiece.rotation %= 4;

      const pattern = getCurrentPattern();
      for (let i = 0; i < pattern.length; i++) {
        const tile = pattern[i];
        moveOutTheWay(tile);
      }

      setCurrentPiece();
    }

    function getPattern(piece: number, rotation: number) {
      return pieces[piece].patterns[rotation];
    }

    function getCurrentPattern() {
      return pieces[currentPiece.piece].patterns[currentPiece.rotation];
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
      return !isInvalid(x, y) && board[y][x] != 0;
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
      return x >= boardWidth;
    }

    function isInvalidX(x: number) {
      return isInvalidLowX(x) || isInvalidHighX(x);
    }

    function isInvalidLowY(y: number) {
      return y >= boardHeight + boardBufferHeight;
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

    function isOccupied(x: number, y: number) {
      return getBoard(x, y) != 0;
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
        throw Error(`Invalid position (${x},${y}).`);
      }
      if (
        !ignoreOccupied &&
        isOccupied(x, y) &&
        getBoard(x, y) != currentPiece.piece
      ) {
        throw Error(`Already occupied (${x}, ${y})`);
      }

      board[y][x] = value;
    }

    function resetBoard() {
      for (let i = 0; i < boardHeight + boardBufferHeight; i++) {
        for (let j = 0; j < boardWidth; j++) {
          setBoard(j, i, 0, true);
        }
      }
    }

    function clearLine(r: number) {
      for (let i = 0; i < boardWidth; i++) {
        setBoard(i, r, 0, true);
      }
      for (let i = r; i > 0; i--) {
        for (let j = 0; j < boardWidth; j++) {
          setBoard(j, i, getBoard(j, i - 1), true);
        }
      }
    }

    function clearLines() {
      for (let i = 0; i < boardHeight + boardBufferHeight; i++) {
        let isFull = true;
        for (let j = 0; j < boardWidth; j++) {
          if (getBoard(j, i) == 0) {
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
        if (holdPiece == 0) {
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
        while (!bottomTilesCollide(1)) {
          move("down");
        }
      }

      if (bottomTilesCollide(1)) {
        if (currentPiece.position.y < boardBufferHeight) {
          resetBoard();
        }

        if (collisionTimer == 0) {
          collisionTimer = 15;
        }

        if (collisionTimer < 5) {
          clearLines();
          currentPiece = newPiece();
          piecesQueue.push(randomPiece());
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
