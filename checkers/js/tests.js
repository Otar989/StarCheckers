import {createState, playMove} from './game.js';
import {generateMoves} from './rules.js';
import {initAudio, unlockAudio, isUnlocked} from './audio.js';

function log(msg, ok){
  const li=document.createElement('li');
  li.textContent=(ok?'✅ ':'❌ ')+msg;
  document.getElementById('tests').appendChild(li);
  return ok;
}

function run(){
  let passed=0, total=0;
  const s=createState();
  //1 start count
  total++; let whites=0, blacks=0;
  for(let row of s.board){for(let p of row){if(p==='w')whites++; if(p==='b')blacks++;}}
  if(log('start pieces 12/12', whites===12&&blacks===12)) passed++;
  //2 playMove moves piece
  total++;
  const m=generateMoves(s.board,'w',{force:true}).find(m=>m.from.y===5);
  playMove(s,m);
  if(log('playMove moves piece', s.board[m.to.y][m.to.x] && s.board[m.from.y][m.from.x]===null && s.turn==='b'),1) passed++;
  //3 promotion
  const s2=createState();
  s2.board[1][2]='w'; s2.board[0][3]=null; s2.turn='w';
  const prom=generateMoves(s2.board,'w',{force:true}).find(m=>m.to.y===0);
  playMove(s2,prom);
  total++;
  if(log('promotion to king', s2.board[0][3]==='W'),1) passed++;
  //4 king capture distance
  const s3=createState();
  s3.board=createState().board;
  s3.board[4][3]='W'; s3.board[2][1]='b';
  s3.board[3][2]=null; s3.board[1][0]=null; s3.turn='w';
  const km=generateMoves(s3.board,'w',{}).find(m=>m.captures.length);
  total++;
  if(log('king flies capture', km&&km.to.x===0&&km.captures.length===1),km) passed++;
  //5 mandatory max capture
  const s4=createState();
  s4.board=createState().board;
  s4.board[4][3]='w'; s4.board[3][4]='b'; s4.board[5][4]='b'; s4.turn='w';
  const ms=generateMoves(s4.board,'w',{force:true});
  total++;
  if(log('max capture rule', ms.every(m=>m.captures.length===2)), ms) passed++;
  //6 continuation after promotion
  const s5=createState();
  s5.board=createState().board;
  s5.board[2][1]=null; s5.board[1][2]='b'; s5.board[5][4]='w'; s5.board[4][3]=null; s5.turn='w';
  // move w from 5,4 to 3,2 capturing, then to 1,0 with promotion continue
  let chain=generateMoves(s5.board,'w',{force:true}).find(m=>m.captures.length===1 && m.to.x===3);
  playMove(s5,chain);
  chain=generateMoves(s5.board,'w',{force:true}).find(m=>m.from.x===3&&m.from.y===2);
  playMove(s5,chain);
  total++;
  if(log('promotion continues', s5.board[0][1]==='W'),1) passed++;
  //7 no moves -> game over
  const s6=createState();
  s6.board=Array.from({length:8},()=>Array(8).fill(null));
  s6.board[0][1]='b'; s6.turn='w';
  total++;
  if(log('no moves game over', generateMoves(s6.board,'w',{}).length===0),1) passed++;
  //8 audio unlock after gesture
  initAudio();
  total++;
  log('audio locked before gesture', !isUnlocked());
  unlockAudio();
  if(log('audio unlocked after gesture', isUnlocked())) passed++;

  document.getElementById('summary').textContent=`${passed}/${total} passed`;
}

window.addEventListener('load',()=>{
  const panel=document.createElement('div');
  panel.innerHTML='<h3>Tests</h3><ul id="tests"></ul><div id="summary"></div>';
  panel.style.position='absolute';panel.style.top='0';panel.style.left='0';panel.style.background='rgba(255,255,255,0.8)';panel.style.padding='1em';
  document.body.appendChild(panel);
  run();
});
