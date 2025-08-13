import { BoardState } from './board';
import { generateMoves } from './moves';

export const hasMoves = (board: BoardState, turn: 'w' | 'b'): boolean =>
  generateMoves(board, turn).length > 0;

export const winner = (board: BoardState): 'w' | 'b' | null => {
  const white = board.some((p) => p && p.toLowerCase() === 'w');
  const black = board.some((p) => p && p.toLowerCase() === 'b');
  if (!white) return 'b';
  if (!black) return 'w';
  return null;
};
