import { BoardState } from './board';
import { Move } from './moves';

export const applyMove = (board: BoardState, move: Move): BoardState => {
  const newBoard = [...board];
  const piece = newBoard[move.from];
  newBoard[move.from] = null;
  newBoard[move.to] = piece;
  move.captures.forEach((idx) => {
    newBoard[idx] = null;
  });
  const row = Math.floor(move.to / 8);
  if (piece === 'w' && row === 0) newBoard[move.to] = 'W';
  if (piece === 'b' && row === 7) newBoard[move.to] = 'B';
  return newBoard;
};
