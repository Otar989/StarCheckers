import {generateMoves} from './rules.js';
import {playMove} from './game.js';

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
let state=null;
let images={};
let selected=null;
let moves=[];
let moveCallback=null;

export function initUI(s, onMove){
  moveCallback = onMove;
  state=s;
  loadImages().then(draw);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMoveEvt);
  canvas.addEventListener('pointerup', onUp);
}

function loadImages(){
  const names=['piece_white','piece_black','king_white','king_black'];
  return Promise.all(names.map(n=>loadImg(`../assets/${n}.svg`).then(img=>images[n]=img)));
}
function loadImg(src){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=src;});}

function boardPos(evt){
  const rect = canvas.getBoundingClientRect();
  const size = rect.width;
  const x = Math.floor((evt.clientX-rect.left)/size*8);
  const y = Math.floor((evt.clientY-rect.top)/size*8);
  return {x,y};
}

function onDown(e){
  const p=boardPos(e);
  const piece = state.board[p.y][p.x];
  if(!piece || (state.turn==='w' && piece.toLowerCase()!=='w') || (state.turn==='b' && piece.toLowerCase()!=='b')) return;
  selected=p;
  moves = generateMoves(state.board, state.turn, state.options).filter(m=>m.from.x===p.x && m.from.y===p.y);
}
function onMoveEvt(e){ if(selected) draw(); }
function onUp(e){
  if(!selected){draw();return;}
  const p=boardPos(e);
  const m = moves.find(m=>m.to.x===p.x && m.to.y===p.y);
  if(m){
    playMove(state,m);
    updateTurn();
    if(moveCallback) moveCallback();
  }
  selected=null; moves=[]; draw();
}

export function setState(s){state=s;draw();}

function draw(){
  const size=canvas.width;
  const sq=size/8;
  ctx.clearRect(0,0,size,size);
  for(let y=0;y<8;y++){
    for(let x=0;x<8;x++){
      ctx.fillStyle=(x+y)%2?'#b58863':'#f0d9b5';
      ctx.fillRect(x*sq,y*sq,sq,sq);
    }
  }
  for(let y=0;y<8;y++){
    for(let x=0;x<8;x++){
      const p=state.board[y][x];
      if(!p) continue;
      const img = images[p==='w'?'piece_white':p==='b'?'piece_black':p==='W'?'king_white':'king_black'];
      ctx.drawImage(img,x*sq,y*sq,sq,sq);
    }
  }
  if(selected){
    ctx.strokeStyle='yellow';
    ctx.lineWidth=3;
    ctx.strokeRect(selected.x*sq,selected.y*sq,sq,sq);
    ctx.fillStyle='rgba(255,255,0,0.3)';
    moves.forEach(m=>{ctx.fillRect(m.to.x*sq,m.to.y*sq,sq,sq);});
  }
}

function updateTurn(){
  document.getElementById('turn-indicator').textContent = state.turn==='w'? 'Ход белых':'Ход чёрных';
}
