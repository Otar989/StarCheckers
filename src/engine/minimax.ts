import { BoardState } from '../rules/board';
import { generateMoves, Move } from '../rules/moves';
import { applyMove } from '../rules/apply';
import { evaluate } from './eval';

const minimax = (
  board: BoardState,
  depth: number,
  maximizing: boolean,
  turn: 'w' | 'b',
): { score: number; move?: Move } => {
  if (depth === 0) {
    return { score: evaluate(board) };
  }
  const moves = generateMoves(board, turn);
  if (moves.length === 0) {
    return { score: maximizing ? -Infinity : Infinity };
  }
  let best: { score: number; move?: Move } = {
    score: maximizing ? -Infinity : Infinity,
  };
  moves.forEach((m) => {
    const next = applyMove(board, m);
    const res = minimax(next, depth - 1, !maximizing, turn === 'w' ? 'b' : 'w');
    if (maximizing ? res.score > best.score : res.score < best.score) {
      best = { score: res.score, move: m };
    }
  });
  return best;
};

export default minimax;
