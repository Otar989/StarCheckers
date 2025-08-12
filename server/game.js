export const SIZE = 8;

export function initialBoard() {
  const board = Array.from({ length: SIZE }, () =>
    Array(SIZE).fill(null)
  );
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < SIZE; c++) {
      if ((r + c) % 2 === 1) board[r][c] = 'b';
    }
  }
  for (let r = SIZE - 3; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if ((r + c) % 2 === 1) board[r][c] = 'w';
    }
  }
  return board;
}

export function validateMove(board, mv, side) {
  const { from, to } = mv;
  const piece = board[from.r][from.c];
  if (!piece || piece !== side) return false;
  if (board[to.r][to.c]) return false;
  const dr = to.r - from.r;
  const dc = Math.abs(to.c - from.c);
  if (side === 'w' && dr !== -1) return false;
  if (side === 'b' && dr !== 1) return false;
  return dc === 1;
}

export function applyMove(board, mv) {
  const { from, to } = mv;
  board[to.r][to.c] = board[from.r][from.c];
  board[from.r][from.c] = null;
  return board;
}

export function whoHasMoves(board) {
  let white = false;
  let black = false;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const p = board[r][c];
      if (p === 'w') white = true;
      if (p === 'b') black = true;
    }
  }
  return { white, black };
}

