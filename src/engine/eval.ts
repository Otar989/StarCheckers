import { BoardState } from '../rules/board';

const pieceValues: Record<string, number> = { w: 1, b: -1, W: 3, B: -3 };

export const evaluate = (board: BoardState): number =>
  board.reduce((acc, p) => acc + (p ? pieceValues[p] : 0), 0);
