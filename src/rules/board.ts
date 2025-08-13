export type Piece = 'w' | 'b' | 'W' | 'B' | null;
export type BoardState = Piece[];

export const initialBoard = (): BoardState => {
  const board: BoardState = Array(64).fill(null);
  for (let i = 0; i < 8; i += 1) {
    for (let j = 0; j < 8; j += 1) {
      const idx = i * 8 + j;
      if ((i + j) % 2 === 1) {
        if (i < 3) board[idx] = 'b';
        else if (i > 4) board[idx] = 'w';
      }
    }
  }
  return board;
};

const files = 'abcdefgh';

export const indexToCoord = (index: number): string => {
  const file = files[index % 8];
  const rank = Math.floor(index / 8) + 1;
  return `${file}${rank}`;
};

export const coordToIndex = (coord: string): number => {
  const file = files.indexOf(coord[0]);
  const rank = parseInt(coord[1], 10) - 1;
  return rank * 8 + file;
};
