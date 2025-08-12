import {generateMoves} from './rules.js';

/**
 * @typedef {{board:string[][],turn:'w'|'b',history:Move[],gameOver:boolean,options:{force:boolean}}} GameState
 */

export function createInitialBoard(){
  const board = Array.from({length:8},()=>Array(8).fill(null));
  for(let y=0;y<3;y++){
    for(let x=0;x<8;x++) if((x+y)%2===1) board[y][x]='b';
  }
  for(let y=5;y<8;y++){
    for(let x=0;x<8;x++) if((x+y)%2===1) board[y][x]='w';
  }
  return board;
}

export function createState(options={force:true}){
  return {board:createInitialBoard(),turn:'w',history:[],gameOver:false,options};
}

/**
 * Apply move to state. Only this function mutates state.
 * @param {GameState} state
 * @param {Move} move
 */
export function playMove(state, move){
  const piece = state.board[move.from.y][move.from.x];
  state.board[move.from.y][move.from.x]=null;
  state.board[move.to.y][move.to.x]=piece;
  const capturedPieces=[];
  for(const c of move.captures){
    capturedPieces.push(state.board[c.y][c.x]);
    state.board[c.y][c.x]=null;
  }
  if(move.promote){
    state.board[move.to.y][move.to.x]= piece==='w'?'W':'B';
  }
  state.history.push({...move,capturedPieces});
  // check continuation
  if(move.captures.length>0){
    const cont = generateMoves(state.board, state.turn, state.options).filter(m=>m.from.x===move.to.x && m.from.y===move.to.y && m.captures.length>0);
    if(cont.length) return; // same player continues
  }
  state.turn = state.turn==='w'?'b':'w';
  const nextMoves = generateMoves(state.board, state.turn, state.options);
  if(nextMoves.length===0) state.gameOver=true;
}

export function undo(state){
  const move = state.history.pop();
  if(!move) return;
  state.turn = state.turn==='w'?'b':'w';
  const piece = state.board[move.to.y][move.to.x];
  state.board[move.to.y][move.to.x]=null;
  state.board[move.from.y][move.from.x]= move.promote ? (piece==='W'?'w':'b'):piece;
  move.captures.forEach((c,i)=>{ state.board[c.y][c.x]= move.capturedPieces[i]; });
  state.gameOver=false;
}
