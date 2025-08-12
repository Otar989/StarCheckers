import {generateMoves} from './rules.js';
import {playMove, undo} from './game.js';

function evaluate(board){
  let score=0;
  for(let y=0;y<8;y++){
    for(let x=0;x<8;x++){
      const p=board[y][x];
      if(!p) continue;
      const center = (3<=x&&x<=4 && 3<=y&&y<=4)?0.1:0;
      const prom = p==='w'? (7-y)*0.03 : p==='b'? y*0.03 :0;
      const val = (p==='w'?1:p==='b'?-1:p==='W'?3:p==='B'?-3:0);
      score += val + Math.sign(val)*(center+prom);
    }
  }
  return score;
}

function minimax(state, depth, alpha, beta, maximizing){
  if(depth===0 || state.gameOver) return evaluate(state.board);
  const moves = generateMoves(state.board, state.turn, state.options);
  if(maximizing){
    let max=-Infinity;
    for(const m of moves){
      playMove(state,m);
      const val = minimax(state, depth-1, alpha, beta, false);
      undo(state);
      if(val>max) max=val;
      if(val>alpha) alpha=val;
      if(beta<=alpha) break;
    }
    return max;
  }else{
    let min=Infinity;
    for(const m of moves){
      playMove(state,m);
      const val = minimax(state, depth-1, alpha, beta, true);
      undo(state);
      if(val<min) min=val;
      if(val<beta) beta=val;
      if(beta<=alpha) break;
    }
    return min;
  }
}

export function findBestMove(state, depth){
  let best=null; let bestVal=-Infinity;
  const moves = generateMoves(state.board, state.turn, state.options);
  for(const m of moves){
    playMove(state,m);
    const val = minimax(state, depth-1, -Infinity, Infinity, false);
    undo(state);
    if(val>bestVal){bestVal=val; best=m;}
  }
  return best;
}
