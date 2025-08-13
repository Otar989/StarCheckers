import { BoardState, Piece } from './board';

export interface Move {
  from: number;
  to: number;
  captures: number[];
}

const directions: Record<string, number[]> = {
  w: [-9, -7],
  b: [7, 9],
};

export const generateMoves = (board: BoardState, turn: 'w' | 'b'): Move[] => {
  const moves: Move[] = [];
  const captures: Move[] = [];
  board.forEach((piece, idx) => {
    if (!piece) return;
    if (piece.toLowerCase() !== turn) return;
    const dirs = piece === 'W' || piece === 'B' ? [-9, -7, 7, 9] : directions[turn];
    dirs.forEach((dir) => {
      const target = idx + dir;
      if (target < 0 || target >= 64) return;
      if (Math.abs((idx % 8) - (target % 8)) !== 1) return;
      const targetPiece = board[target];
      if (!targetPiece) {
        moves.push({ from: idx, to: target, captures: [] });
      } else if (targetPiece.toLowerCase() !== turn) {
        const landing = idx + dir * 2;
        if (
          landing >= 0 &&
          landing < 64 &&
          board[landing] === null &&
          Math.abs((landing % 8) - (idx % 8)) === 2
        ) {
          captures.push({ from: idx, to: landing, captures: [target] });
        }
      }
    });
  });
  return captures.length > 0 ? captures : moves;
};
