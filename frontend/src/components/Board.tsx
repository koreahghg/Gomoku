import { useRef, useEffect, useState, useCallback, memo } from 'react';
import { GameHook } from '../hooks/useGame';
import { Stone } from '../types/game';

const CELL = 40;
const PAD  = 24;   // canvas edge → first intersection
const N    = 15;
export const SZ = PAD * 2 + (N - 1) * CELL;  // 608

const STAR_POINTS = [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]] as const;
const STONE_R = CELL / 2 - 3;  // 17

function gx(col: number) { return PAD + col * CELL; }
function gy(row: number) { return PAD + row * CELL; }

function hitCell(px: number, py: number): [number, number] | null {
  const col = Math.round((px - PAD) / CELL);
  const row = Math.round((py - PAD) / CELL);
  if (col < 0 || col >= N || row < 0 || row >= N) return null;
  const dx = px - gx(col), dy = py - gy(row);
  if (dx * dx + dy * dy > (CELL * 0.55) ** 2) return null;
  return [row, col];
}

function drawStone(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  color: 'black' | 'white',
  isWinner: boolean,
) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 3;

  const grad = ctx.createRadialGradient(
    cx - r * 0.28, cy - r * 0.32, r * 0.04,
    cx + r * 0.05, cy + r * 0.08, r,
  );
  if (color === 'black') {
    grad.addColorStop(0, '#808080');
    grad.addColorStop(0.3, '#2c2c2c');
    grad.addColorStop(1, '#060606');
  } else {
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.38, '#f2f2f2');
    grad.addColorStop(1, '#c0c0c0');
  }

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  if (isWinner) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r + 2.5, 0, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.restore();
  }
}

function drawBoard(
  ctx: CanvasRenderingContext2D,
  board: Stone[][],
  lastMove: [number, number] | null,
  winningStones: [number, number][],
  hover: [number, number] | null,
  playerColor: Stone,
  isGameOver: boolean,
) {
  ctx.clearRect(0, 0, SZ, SZ);

  // Wood background gradient
  const bg = ctx.createLinearGradient(0, 0, SZ, SZ);
  bg.addColorStop(0, '#D9AA60');
  bg.addColorStop(0.5, '#C8964E');
  bg.addColorStop(1, '#B88040');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SZ, SZ);

  // Grid lines
  ctx.strokeStyle = '#7A5420';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < N; i++) {
    ctx.beginPath(); ctx.moveTo(gx(i), gy(0)); ctx.lineTo(gx(i), gy(N - 1)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx(0), gy(i)); ctx.lineTo(gx(N - 1), gy(i)); ctx.stroke();
  }

  // Outer border (bolder)
  ctx.strokeStyle = '#5A3A0E';
  ctx.lineWidth = 2;
  ctx.strokeRect(gx(0), gy(0), (N - 1) * CELL, (N - 1) * CELL);

  // Star points (화점)
  ctx.fillStyle = '#5A3A0E';
  for (const [r, c] of STAR_POINTS) {
    ctx.beginPath();
    ctx.arc(gx(c), gy(r), 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Coordinate labels
  ctx.fillStyle = 'rgba(90,58,14,0.65)';
  ctx.font = 'bold 9px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < N; i++) {
    ctx.fillText(String(i + 1), gx(i), PAD / 2);
    ctx.fillText(String(i + 1), PAD / 2, gy(i));
  }

  // Hover preview
  if (hover && !isGameOver && board[hover[0]][hover[1]] === null) {
    const [hr, hc] = hover;
    ctx.beginPath();
    ctx.arc(gx(hc), gy(hr), STONE_R, 0, Math.PI * 2);
    ctx.fillStyle = playerColor === 'black'
      ? 'rgba(10,10,10,0.32)'
      : 'rgba(245,245,245,0.52)';
    ctx.fill();
  }

  // Stones
  const winSet = new Set(winningStones.map(([r, c]) => `${r},${c}`));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const stone = board[r][c];
      if (!stone) continue;
      drawStone(ctx, gx(c), gy(r), STONE_R, stone, winSet.has(`${r},${c}`));
    }
  }

  // Last move marker (suppressed when winning stones are highlighted)
  if (lastMove && winningStones.length === 0) {
    const [lr, lc] = lastMove;
    ctx.beginPath();
    ctx.arc(gx(lc), gy(lr), 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
  }
}

const Board = memo(function Board({ game }: { game: GameHook }) {
  const { state, placeStone } = game;
  const { board, lastMove, phase, playerColor, winningStones } = state;
  const isGameOver = phase !== 'playing';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<[number, number] | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawBoard(ctx, board, lastMove, winningStones, hover, playerColor, isGameOver);
  }, [board, lastMove, winningStones, hover, playerColor, isGameOver]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isGameOver) { setHover(null); return; }
    const rect = canvasRef.current!.getBoundingClientRect();
    const sx = SZ / rect.width, sy = SZ / rect.height;
    setHover(hitCell((e.clientX - rect.left) * sx, (e.clientY - rect.top) * sy));
  }, [isGameOver]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isGameOver) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const sx = SZ / rect.width, sy = SZ / rect.height;
    const cell = hitCell((e.clientX - rect.left) * sx, (e.clientY - rect.top) * sy);
    if (cell) placeStone(cell[0], cell[1]);
  }, [isGameOver, placeStone]);

  const handleMouseLeave = useCallback(() => setHover(null), []);

  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
  return (
    <canvas
      ref={canvasRef}
      width={SZ * dpr}
      height={SZ * dpr}
      className={`rounded-xl shadow-2xl block ${isGameOver ? 'cursor-default' : 'cursor-crosshair'}`}
      style={{ width: SZ, height: SZ, maxWidth: '100%' }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseLeave={handleMouseLeave}
    />
  );
});

export default Board;
