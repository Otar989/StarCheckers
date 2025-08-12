import assert from 'assert';
import { initialBoard, validateMove, applyMove } from '../game.js';

console.log('Running tests');

function testSimpleMove() {
  const board = initialBoard();
  const mv = { from: { r: 5, c: 0 }, to: { r: 4, c: 1 } };
  assert.strictEqual(validateMove(board, mv, 'w'), true, 'simple move should be valid');
  applyMove(board, mv);
  assert.strictEqual(board[4][1], 'w');
  assert.strictEqual(board[5][0], null);
}

function testInvalidSimpleMove() {
  const board = initialBoard();
  const mv = { from: { r: 5, c: 0 }, to: { r: 6, c: 1 } }; // backward move
  assert.strictEqual(validateMove(board, mv, 'w'), false, 'backward move should be invalid');
}

function testCapture() {
  const board = initialBoard();
  board[4][3] = 'b';
  const mv = { from: { r: 5, c: 2 }, to: { r: 3, c: 4 }, captures: [{ r: 4, c: 3 }] };
  assert.strictEqual(validateMove(board, mv, 'w'), true, 'capture should be valid');
  applyMove(board, mv);
  assert.strictEqual(board[3][4], 'w');
  assert.strictEqual(board[4][3], null);
}

function testInvalidCapture() {
  const board = initialBoard();
  board[4][3] = 'b';
  board[3][4] = 'b'; // landing square occupied
  const mv = { from: { r: 5, c: 2 }, to: { r: 3, c: 4 }, captures: [{ r: 4, c: 3 }] };
  assert.strictEqual(validateMove(board, mv, 'w'), false, 'capture with occupied landing should be invalid');
}

function testKingMove() {
  const board = initialBoard();
  board[4][3] = 'W';
  board[5][2] = null;
  const mv = { from: { r: 4, c: 3 }, to: { r: 5, c: 2 } };
  assert.strictEqual(validateMove(board, mv, 'w'), true, 'king should move backwards');
  applyMove(board, mv);
  assert.strictEqual(board[5][2], 'W');
}

function testInvalidKingMove() {
  const board = initialBoard();
  board[4][3] = 'W';
  board[5][2] = null;
  const mv = { from: { r: 4, c: 3 }, to: { r: 6, c: 5 } }; // too far
  assert.strictEqual(validateMove(board, mv, 'w'), false, 'king moving too far should be invalid');
}

function testPromotion() {
  const board = initialBoard();
  board[1][2] = 'w';
  board[0][3] = null;
  const mv = { from: { r: 1, c: 2 }, to: { r: 0, c: 3 } };
  assert.strictEqual(validateMove(board, mv, 'w'), true, 'promotion move should be valid');
  assert.strictEqual(mv.promote, true, 'promotion flag should be set');
  applyMove(board, mv);
  assert.strictEqual(board[0][3], 'W');
}

function testMultiCapture() {
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  board[5][0] = 'w';
  board[4][1] = 'b';
  board[2][3] = 'b';
  const mv = {
    from: { r: 5, c: 0 },
    to: { r: 1, c: 4 },
    captures: [
      { r: 4, c: 1 },
      { r: 2, c: 3 }
    ]
  };
  assert.strictEqual(validateMove(board, mv, 'w'), true, 'multi-capture should be valid');
  applyMove(board, mv);
  assert.strictEqual(board[1][4], 'w');
  assert.strictEqual(board[4][1], null);
  assert.strictEqual(board[2][3], null);
}

testSimpleMove();
testInvalidSimpleMove();
testCapture();
testInvalidCapture();
testKingMove();
testInvalidKingMove();
testPromotion();
testMultiCapture();

console.log('All tests passed');
