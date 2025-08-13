import { describe, it, expect } from 'vitest';
import { initialBoard, coordToIndex, indexToCoord } from './board';
import { generateMoves } from './moves';

describe('board utils', () => {
  it('converts coordinates', () => {
    expect(indexToCoord(0)).toBe('a1');
    expect(coordToIndex('h8')).toBe(63);
  });

  it('generates initial moves for white', () => {
    const board = initialBoard();
    const moves = generateMoves(board, 'w');
    expect(moves.length).toBeGreaterThan(0);
  });
});
