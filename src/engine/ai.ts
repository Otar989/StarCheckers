import { BoardState } from '../rules/board';
import { generateMoves } from '../rules/moves';
import minimax from './minimax';

export const chooseMove = (board: BoardState, level: 0 | 1 | 2): [number, number] => {
  const moves = generateMoves(board, 'b');
  if (!moves.length) return [0, 0];
  if (level === 0) {
    const m = moves[Math.floor(Math.random() * moves.length)];
    return [m.from, m.to];
  }
  const depth = level === 1 ? 3 : 5;
  const { move } = minimax(board, depth, false, 'b');
  if (move) return [move.from, move.to];
  return [0, 0];
};
