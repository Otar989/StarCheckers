export const SIZE = 8;
export const E = 0;
export const W = 1;
export const B = 2;
export const WK = 3;
export const BK = 4;

export function initialBoard() {
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(E));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < SIZE; c++) {
      if ((r + c) % 2 === 1) board[r][c] = B;
    }
  }
  for (let r = SIZE - 3; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if ((r + c) % 2 === 1) board[r][c] = W;
    }
  }
  return board;
}

export function validateMove(board, mv, side) {
  const [fr, fc] = mv.from;
  const piece = board[fr][fc];
  if (!piece) return false;
  if (side === 'W' && piece !== W && piece !== WK) return false;
  if (side === 'B' && piece !== B && piece !== BK) return false;
  return true;
}

export function applyMove(board, mv) {
  const [fr, fc] = mv.from;
  const [tr, tc] = mv.to;
  const piece = board[fr][fc];
  board[fr][fc] = E;
  mv.caps?.forEach(([r, c]) => { board[r][c] = E; });
  board[tr][tc] = mv.promote ? (piece === W ? WK : piece === B ? BK : piece) : piece;
  return board;
}

export function whoHasMoves(board) {
  let white = false;
  let black = false;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const p = board[r][c];
      if (p === W || p === WK) white = true;
      if (p === B || p === BK) black = true;
    }
  }
  return { white, black };
}

