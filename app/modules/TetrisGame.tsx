"use client";
import styles from "../styles/TetrisGame.module.css";
import { useEffect, useRef } from "react";

export const TetrisGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // ── constants ──────────────────────────────────────────────────────────
    const COLS = 10;
    const ROWS = 20;
    const TILE = 30;
    const BOARD_X = Math.floor((canvas.width - COLS * TILE) / 2);
    const BOARD_Y = 40;

    // SRS wall-kick data  [right-kick, left-kick]  per piece type
    // Each entry: array of [dx,dy] offsets to try
    const KICKS_JLSTZ: [number, number][][] = [
      [[-1,0],[1,0],[-1,1],[1,-1],[0,2],[-1,2],[1,2]],   // 0->R / 0->L
      [[1,0],[-1,0],[1,-1],[-1,1],[0,-2],[1,-2],[-1,-2]], // R->2 / R->0
      [[1,0],[-1,0],[1,1],[-1,-1],[0,-2],[1,-2],[-1,-2]], // 2->L / 2->R
      [[-1,0],[1,0],[-1,-1],[1,1],[0,2],[-1,2],[1,2]],    // L->0 / L->2
    ];
    const KICKS_I: [number, number][][] = [
      [[-2,0],[2,0],[-2,-1],[2,1]],
      [[1,0],[-2,0],[1,2],[-2,-1]],
      [[2,0],[-2,0],[2,1],[-2,-1]],
      [[-1,0],[2,0],[-1,2],[2,-1]],
    ];

    // ── piece definitions ──────────────────────────────────────────────────
    // Each piece: 4 rotation states, each state is array of [col,row] offsets from pivot
    type PieceDef = { color: string; states: [number,number][][] };

    const PIECES: PieceDef[] = [
      { // I - cyan
        color: "#00f0f0",
        states: [
          [[-1,0],[0,0],[1,0],[2,0]],
          [[0,-1],[0,0],[0,1],[0,2]],
          [[-1,1],[0,1],[1,1],[2,1]],
          [[1,-1],[1,0],[1,1],[1,2]],
        ],
      },
      { // O - yellow
        color: "#f0f000",
        states: [
          [[0,0],[1,0],[0,1],[1,1]],
          [[0,0],[1,0],[0,1],[1,1]],
          [[0,0],[1,0],[0,1],[1,1]],
          [[0,0],[1,0],[0,1],[1,1]],
        ],
      },
      { // T - purple
        color: "#a000f0",
        states: [
          [[-1,0],[0,0],[1,0],[0,-1]],
          [[0,-1],[0,0],[0,1],[1,0]],
          [[-1,0],[0,0],[1,0],[0,1]],
          [[0,-1],[0,0],[0,1],[-1,0]],
        ],
      },
      { // S - green
        color: "#00f000",
        states: [
          [[0,0],[1,0],[-1,1],[0,1]],
          [[0,-1],[0,0],[1,0],[1,1]],
          [[0,0],[1,0],[-1,1],[0,1]],
          [[0,-1],[0,0],[1,0],[1,1]],
        ],
      },
      { // Z - red
        color: "#f00000",
        states: [
          [[-1,0],[0,0],[0,1],[1,1]],
          [[1,-1],[0,0],[1,0],[0,1]],
          [[-1,0],[0,0],[0,1],[1,1]],
          [[1,-1],[0,0],[1,0],[0,1]],
        ],
      },
      { // J - blue
        color: "#0000f0",
        states: [
          [[-1,-1],[-1,0],[0,0],[1,0]],
          [[0,-1],[1,-1],[0,0],[0,1]],
          [[-1,0],[0,0],[1,0],[1,1]],
          [[0,-1],[0,0],[-1,1],[0,1]],
        ],
      },
      { // L - orange
        color: "#f0a000",
        states: [
          [[1,-1],[-1,0],[0,0],[1,0]],
          [[0,-1],[0,0],[0,1],[1,1]],
          [[-1,0],[0,0],[1,0],[-1,1]],
          [[-1,-1],[0,-1],[0,0],[0,1]],
        ],
      },
    ];

    // ── board ──────────────────────────────────────────────────────────────
    type Cell = string | null;
    const board: Cell[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

    // ── piece state ────────────────────────────────────────────────────────
    interface ActivePiece { type: number; rot: number; x: number; y: number; }

    function newPiece(type: number): ActivePiece {
      return { type, rot: 0, x: Math.floor(COLS / 2), y: 1 };
    }

    function cells(p: ActivePiece): [number,number][] {
      return PIECES[p.type].states[p.rot].map(([dc,dr]) => [p.x + dc, p.y + dr]);
    }

    function valid(p: ActivePiece): boolean {
      return cells(p).every(([c,r]) => c >= 0 && c < COLS && r < ROWS && (r < 0 || board[r][c] === null));
    }

    // ── bag randomizer (7-bag) ─────────────────────────────────────────────
    let bag: number[] = [];
    function nextFromBag(): number {
      if (bag.length === 0) {
        bag = [0,1,2,3,4,5,6];
        for (let i = bag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [bag[i], bag[j]] = [bag[j], bag[i]];
        }
      }
      return bag.pop()!;
    }

    // ── queue & hold ───────────────────────────────────────────────────────
    const PREVIEW_COUNT = 5;
    const queue: number[] = Array.from({ length: PREVIEW_COUNT }, () => nextFromBag());
    let holdType: number | null = null;
    let holdUsed = false;

    function dequeue(): ActivePiece {
      const t = queue.shift()!;
      queue.push(nextFromBag());
      return newPiece(t);
    }

    // ── game state ─────────────────────────────────────────────────────────
    let current = dequeue();
    let score = 0;
    let lines = 0;
    let level = 1;
    let gameOver = false;

    // ── lock delay ─────────────────────────────────────────────────────────
    const LOCK_DELAY_MS = 500;
    let lockTimer = 0;
    let lockResets = 0;
    const MAX_LOCK_RESETS = 15;

    // ── line clear animation ───────────────────────────────────────────────
    let flashRows: number[] = [];
    let flashTimer = 0;
    const FLASH_DURATION = 400; // ms

    // ── DAS / ARR ──────────────────────────────────────────────────────────
    const DAS = 167; // ms before repeat starts
    const ARR = 33;  // ms between repeats
    const keys: Record<string, { held: boolean; das: number; arr: number }> = {};
    function keyState(k: string) {
      if (!keys[k]) keys[k] = { held: false, das: 0, arr: 0 };
      return keys[k];
    }

    window.addEventListener("keydown", (e) => {
      if (["ArrowLeft","ArrowRight","ArrowDown","ArrowUp","z","x","c"," "].includes(e.key)) {
        e.preventDefault();
      }
      const s = keyState(e.key);
      if (!s.held) { s.held = true; s.das = 0; s.arr = 0; handleKeyPress(e.key); }
    });
    window.addEventListener("keyup", (e) => {
      const s = keyState(e.key);
      s.held = false; s.das = 0; s.arr = 0;
    });

    // ── rotation with SRS wall kicks ───────────────────────────────────────
    function rotate(dir: 1 | -1) {
      const isI = current.type === 0;
      const kicks = isI ? KICKS_I : KICKS_JLSTZ;
      const fromRot = current.rot;
      const toRot = (fromRot + dir + 4) % 4;
      const kickSet = kicks[fromRot];

      const attempt = { ...current, rot: toRot };
      if (valid(attempt)) { current = attempt; resetLock(); return; }

      for (const [dx, dy] of kickSet) {
        const kicked = { ...attempt, x: attempt.x + (dir === 1 ? dx : -dx), y: attempt.y + (dir === 1 ? dy : -dy) };
        if (valid(kicked)) { current = kicked; resetLock(); return; }
      }
    }

    function resetLock() {
      if (lockResets < MAX_LOCK_RESETS) { lockTimer = 0; lockResets++; }
    }

    // ── movement ───────────────────────────────────────────────────────────
    function moveH(dx: number) {
      const moved = { ...current, x: current.x + dx };
      if (valid(moved)) { current = moved; resetLock(); }
    }

    function softDrop() {
      const moved = { ...current, y: current.y + 1 };
      if (valid(moved)) { current = moved; score += 1; dropTimer = 0; }
    }

    function hardDrop() {
      let dropped = 0;
      while (true) {
        const moved = { ...current, y: current.y + 1 };
        if (!valid(moved)) break;
        current = moved; dropped++;
      }
      score += dropped * 2;
      lock();
    }

    function ghostY(): number {
      let gy = current.y;
      while (true) {
        const moved = { ...current, y: gy + 1 };
        if (!valid(moved)) break;
        gy++;
      }
      return gy;
    }

    // ── hold ───────────────────────────────────────────────────────────────
    function doHold() {
      if (holdUsed) return;
      holdUsed = true;
      if (holdType === null) {
        holdType = current.type;
        current = dequeue();
      } else {
        const tmp = holdType;
        holdType = current.type;
        current = newPiece(tmp);
      }
      lockTimer = 0; lockResets = 0;
    }

    // ── locking & line clears ──────────────────────────────────────────────
    function lock() {
      cells(current).forEach(([c,r]) => {
        if (r >= 0) board[r][c] = PIECES[current.type].color;
      });

      const full: number[] = [];
      for (let r = 0; r < ROWS; r++) {
        if (board[r].every(c => c !== null)) full.push(r);
      }

      if (full.length > 0) {
        flashRows = full;
        flashTimer = FLASH_DURATION;
        // scoring: Puyo-style multiplier
        const pts = [0, 100, 300, 500, 800];
        score += (pts[full.length] ?? 800) * level;
        lines += full.length;
        level = Math.floor(lines / 10) + 1;
      }

      current = dequeue();
      holdUsed = false;
      lockTimer = 0; lockResets = 0;

      if (!valid(current)) { gameOver = true; }
    }

    function applyClears() {
      for (const r of flashRows.slice().sort((a,b) => b - a)) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(null));
      }
      flashRows = [];
    }

    // ── gravity ────────────────────────────────────────────────────────────
    function gravityMs(): number {
      // Puyo Puyo 2 style: gets faster each level
      return Math.max(50, 1000 * Math.pow(0.85, level - 1));
    }

    let dropTimer = 0;

    // ── input repeat (DAS/ARR) ─────────────────────────────────────────────
    function handleKeyPress(key: string) {
      if (gameOver || flashTimer > 0) return;
      switch (key) {
        case "ArrowLeft":  moveH(-1); break;
        case "ArrowRight": moveH(1);  break;
        case "ArrowDown":  softDrop(); break;
        case "ArrowUp":
        case "x":          rotate(1);  break;
        case "z":          rotate(-1); break;
        case "c":          doHold();   break;
        case " ":          hardDrop(); break;
      }
    }

    function tickDAS(dt: number) {
      for (const key of ["ArrowLeft","ArrowRight","ArrowDown"]) {
        const s = keyState(key);
        if (!s.held) continue;
        s.das += dt;
        if (s.das >= DAS) {
          s.arr += dt;
          if (s.arr >= ARR) {
            s.arr = 0;
            handleKeyPress(key);
          }
        }
      }
    }

    // ── drawing helpers ────────────────────────────────────────────────────
    function drawTile(x: number, y: number, color: string, alpha = 1) {
      ctx.save();
      ctx.globalAlpha = alpha;
      // main fill
      ctx.fillStyle = color;
      ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
      // highlight top-left
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(x + 1, y + 1, TILE - 2, 4);
      ctx.fillRect(x + 1, y + 1, 4, TILE - 2);
      // shadow bottom-right
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(x + 1, y + TILE - 5, TILE - 2, 4);
      ctx.fillRect(x + TILE - 5, y + 1, 4, TILE - 2);
      ctx.restore();
    }

    function drawBoard() {
      // background
      ctx.fillStyle = "#111";
      ctx.fillRect(BOARD_X, BOARD_Y, COLS * TILE, ROWS * TILE);

      // grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(BOARD_X + c * TILE, BOARD_Y);
        ctx.lineTo(BOARD_X + c * TILE, BOARD_Y + ROWS * TILE);
        ctx.stroke();
      }
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(BOARD_X, BOARD_Y + r * TILE);
        ctx.lineTo(BOARD_X + COLS * TILE, BOARD_Y + r * TILE);
        ctx.stroke();
      }

      // placed cells
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = board[r][c];
          if (!cell) continue;
          const isFlash = flashRows.includes(r);
          if (isFlash) {
            const t = 1 - flashTimer / FLASH_DURATION;
            const flash = Math.sin(t * Math.PI * 6) * 0.5 + 0.5;
            ctx.save();
            ctx.globalAlpha = 0.4 + flash * 0.6;
            ctx.fillStyle = "white";
            ctx.fillRect(BOARD_X + c * TILE + 1, BOARD_Y + r * TILE + 1, TILE - 2, TILE - 2);
            ctx.restore();
          } else {
            drawTile(BOARD_X + c * TILE, BOARD_Y + r * TILE, cell);
          }
        }
      }

      // board border
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 2;
      ctx.strokeRect(BOARD_X, BOARD_Y, COLS * TILE, ROWS * TILE);
    }

    function drawGhost() {
      const gy = ghostY();
      if (gy === current.y) return;
      const color = PIECES[current.type].color;
      PIECES[current.type].states[current.rot].forEach(([dc,dr]) => {
        const c = current.x + dc;
        const r = gy + dr;
        if (r >= 0 && r < ROWS) {
          ctx.save();
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = color;
          ctx.fillRect(BOARD_X + c * TILE + 1, BOARD_Y + r * TILE + 1, TILE - 2, TILE - 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.strokeRect(BOARD_X + c * TILE + 1, BOARD_Y + r * TILE + 1, TILE - 2, TILE - 2);
          ctx.restore();
        }
      });
    }

    function drawCurrent() {
      const color = PIECES[current.type].color;
      cells(current).forEach(([c,r]) => {
        if (r >= 0) drawTile(BOARD_X + c * TILE, BOARD_Y + r * TILE, color);
      });
    }

    function drawMiniPiece(type: number, cx: number, cy: number, tileSize: number) {
      const color = PIECES[type].color;
      const offsets = PIECES[type].states[0];
      // center the piece in the preview box
      const minC = Math.min(...offsets.map(([c]) => c));
      const maxC = Math.max(...offsets.map(([c]) => c));
      const minR = Math.min(...offsets.map(([,r]) => r));
      const maxR = Math.max(...offsets.map(([,r]) => r));
      const pw = (maxC - minC + 1) * tileSize;
      const ph = (maxR - minR + 1) * tileSize;
      const ox = cx - pw / 2;
      const oy = cy - ph / 2;
      offsets.forEach(([dc,dr]) => {
        const px = ox + (dc - minC) * tileSize;
        const py = oy + (dr - minR) * tileSize;
        ctx.fillStyle = color;
        ctx.fillRect(px + 1, py + 1, tileSize - 2, tileSize - 2);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(px + 1, py + 1, tileSize - 2, 3);
        ctx.fillRect(px + 1, py + 1, 3, tileSize - 2);
      });
    }

    function drawSidePanels() {
      const panelW = 120;
      const miniTile = 18;
      const rightX = BOARD_X + COLS * TILE + 16;
      const leftX = BOARD_X - panelW - 16;

      ctx.font = "bold 13px 'Segoe UI', sans-serif";
      ctx.textAlign = "left";

      // ── NEXT ──
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.roundRect(rightX, BOARD_Y, panelW, PREVIEW_COUNT * 60 + 10, 8);
      ctx.fill();

      ctx.fillStyle = "#aaa";
      ctx.fillText("NEXT", rightX + 10, BOARD_Y + 18);

      for (let i = 0; i < PREVIEW_COUNT; i++) {
        drawMiniPiece(queue[i], rightX + panelW / 2, BOARD_Y + 40 + i * 60, miniTile);
      }

      // ── HOLD ──
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.roundRect(leftX, BOARD_Y, panelW, 80, 8);
      ctx.fill();

      ctx.fillStyle = "#aaa";
      ctx.fillText("HOLD", leftX + 10, BOARD_Y + 18);
      if (holdType !== null) {
        ctx.save();
        if (holdUsed) ctx.globalAlpha = 0.4;
        drawMiniPiece(holdType, leftX + panelW / 2, BOARD_Y + 50, miniTile);
        ctx.restore();
      }

      // ── SCORE / LEVEL / LINES ──
      const statsY = BOARD_Y + 100;
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.roundRect(leftX, statsY, panelW, 130, 8);
      ctx.fill();

      ctx.fillStyle = "#aaa";
      ctx.fillText("SCORE", leftX + 10, statsY + 20);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 15px 'Segoe UI', sans-serif";
      ctx.fillText(score.toString(), leftX + 10, statsY + 40);

      ctx.font = "bold 13px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#aaa";
      ctx.fillText("LEVEL", leftX + 10, statsY + 68);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 15px 'Segoe UI', sans-serif";
      ctx.fillText(level.toString(), leftX + 10, statsY + 88);

      ctx.font = "bold 13px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#aaa";
      ctx.fillText("LINES", leftX + 10, statsY + 110);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 15px 'Segoe UI', sans-serif";
      ctx.fillText(lines.toString(), leftX + 10, statsY + 130);

      // ── CONTROLS ──
      const ctrlY = statsY + 150;
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath();
      ctx.roundRect(leftX, ctrlY, panelW, 160, 8);
      ctx.fill();

      ctx.font = "11px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#888";
      const controls = [
        ["← →", "Move"],
        ["↓", "Soft drop"],
        ["Space", "Hard drop"],
        ["↑ / X", "Rotate R"],
        ["Z", "Rotate L"],
        ["C", "Hold"],
      ];
      controls.forEach(([key, desc], i) => {
        ctx.fillStyle = "#666";
        ctx.fillText(key, leftX + 8, ctrlY + 18 + i * 24);
        ctx.fillStyle = "#999";
        ctx.fillText(desc, leftX + 48, ctrlY + 18 + i * 24);
      });
    }

    function drawGameOver() {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(BOARD_X, BOARD_Y, COLS * TILE, ROWS * TILE);
      ctx.fillStyle = "#f55";
      ctx.font = "bold 28px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", BOARD_X + COLS * TILE / 2, BOARD_Y + ROWS * TILE / 2 - 20);
      ctx.fillStyle = "#aaa";
      ctx.font = "16px 'Segoe UI', sans-serif";
      ctx.fillText("Press R to restart", BOARD_X + COLS * TILE / 2, BOARD_Y + ROWS * TILE / 2 + 16);
    }

    // ── restart ────────────────────────────────────────────────────────────
    function restart() {
      for (let r = 0; r < ROWS; r++) board[r].fill(null);
      bag = [];
      queue.length = 0;
      for (let i = 0; i < PREVIEW_COUNT; i++) queue.push(nextFromBag());
      holdType = null; holdUsed = false;
      score = 0; lines = 0; level = 1;
      gameOver = false;
      flashRows = []; flashTimer = 0;
      dropTimer = 0; lockTimer = 0; lockResets = 0;
      current = dequeue();
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "r" || e.key === "R") restart();
    });

    // ── main loop ──────────────────────────────────────────────────────────
    let lastTime = 0;

    function loop(ts: number) {
      const dt = Math.min(ts - lastTime, 50); // cap at 50ms to avoid spiral
      lastTime = ts;

      if (!gameOver) {
        tickDAS(dt);

        if (flashTimer > 0) {
          flashTimer -= dt;
          if (flashTimer <= 0) { flashTimer = 0; applyClears(); }
        } else {
          // gravity
          dropTimer += dt;
          const grav = gravityMs();
          if (dropTimer >= grav) {
            dropTimer -= grav;
            const moved = { ...current, y: current.y + 1 };
            if (valid(moved)) {
              current = moved;
              lockTimer = 0; lockResets = 0;
            } else {
              // piece is on the ground — run lock delay
              lockTimer += dt;
              if (lockTimer >= LOCK_DELAY_MS) lock();
            }
          } else {
            // also tick lock delay when piece is grounded but gravity hasn't fired
            const grounded = !valid({ ...current, y: current.y + 1 });
            if (grounded) {
              lockTimer += dt;
              if (lockTimer >= LOCK_DELAY_MS) lock();
            }
          }
        }
      }

      // draw
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // title
      ctx.fillStyle = "#fff";
      ctx.font = "bold 20px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("TETRIS", canvas.width / 2, 26);

      drawBoard();
      if (!gameOver && flashTimer <= 0) { drawGhost(); drawCurrent(); }
      drawSidePanels();
      if (gameOver) drawGameOver();

      requestAnimationFrame(loop);
    }

    requestAnimationFrame((ts) => { lastTime = ts; requestAnimationFrame(loop); });

    return () => {
      // cleanup listeners on unmount — re-add with named refs would be cleaner
      // but for this single-mount component this is fine
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={styles["game-canvas"]}
      width={700}
      height={680}
    />
  );
};
