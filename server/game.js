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
  const captures = mv.captures || [];
  const piece = board[from.r][from.c];
  if (!piece || piece.toLowerCase() !== side) return false;
  if (board[to.r][to.c]) return false;

  const isKing = piece === 'W' || piece === 'B';
  const temp = board.map(row => row.slice());
  const opponent = side === 'w' ? ['b', 'B'] : ['w', 'W'];
  let cur = { ...from };

  // remove piece from starting square for simulation
  temp[from.r][from.c] = null;

  if (captures.length) {
    for (const cap of captures) {
      const dr = cap.r - cur.r;
      const dc = cap.c - cur.c;
      if (Math.abs(dr) !== 1 || Math.abs(dc) !== 1) return false;
      if (!isKing) {
        const dir = side === 'w' ? -1 : 1;
        if (dr !== dir) return false;
      }
      const landing = { r: cap.r + dr, c: cap.c + dc };
      if (
        landing.r < 0 ||
        landing.r >= SIZE ||
        landing.c < 0 ||
        landing.c >= SIZE
      )
        return false;
      const captured = temp[cap.r][cap.c];
      if (!captured || !opponent.includes(captured)) return false;
      if (temp[landing.r][landing.c] !== null) return false;
      // remove captured piece and move current position
      temp[cap.r][cap.c] = null;
      cur = landing;
    }
    // final landing square must match 'to'
    if (cur.r !== to.r || cur.c !== to.c) return false;
  } else {
    const dr = to.r - from.r;
    const dc = to.c - from.c;
    if (Math.abs(dc) !== 1) return false;
    if (!isKing) {
      const dir = side === 'w' ? -1 : 1;
      if (dr !== dir) return false;
    } else {
      if (Math.abs(dr) !== 1) return false;
    }
  }

  // promotion check
  mv.promote = false;
  if (!isKing) {
    if ((side === 'w' && to.r === 0) || (side === 'b' && to.r === SIZE - 1)) {
      mv.promote = true;
    }
  }

  return true;
}

export function applyMove(board, mv) {
  const { from, to } = mv;
  const captures = mv.captures || [];
  let piece = board[from.r][from.c];
  board[from.r][from.c] = null;
  for (const cap of captures) {
    board[cap.r][cap.c] = null;
  }
  if (mv.promote) piece = piece.toUpperCase();
  board[to.r][to.c] = piece;
  return board;
}

export function whoHasMoves(board) {
  let white = false;
  let black = false;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const p = board[r][c];
      if (p && p.toLowerCase() === 'w') white = true;
      if (p && p.toLowerCase() === 'b') black = true;
    }
  }
  return { white, black };
}

