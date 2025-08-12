// Telegram
const tg = window.Telegram?.WebApp; tg?.expand(); tg?.ready();

// WS URL: рендер
const WS_URL = (location.origin.replace('http','ws')) + '/ws';

// ==== Константы ====
const SIZE=8, E=0, W=1, B=2, WK=3, BK=4;
const MODE_AI='ai', MODE_HOT='hotseat', MODE_ON='online';

// ==== Состояние ====
const state = {
  board:[], turn:W, history:[], record:[], curPly:-1,
  selected:null, legal:[], mode:MODE_AI,
  sfx:true, musicOn:true, hints:false,
  aiThinking:false,
  ws:null, roomId:null, myColor:null
};

// ==== DOM ====
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const ui = {
  mode: $('#mode'), level: $('#level'), stake: $('#stake'),
  find: $('#find'), leave: $('#leave'),
  music: $('#music'), sfx: $('#sfx'), hints: $('#hints'),
  hintOnce: $('#hintOnce'), newBtn: $('#new'), undo: $('#undo'),
  turn: $('#turn'), score: $('#score'), status: $('#status'),
  moves: $('#moves'), roomId: $('#roomId'), myColor: $('#myColor'),
  joinById: $('#joinById'), roomInput: $('#roomInput')
};
function $(s){return document.querySelector(s);}

// ==== Аудио (мягкая музыка + sfx) ====
const AudioKit=(()=>{let C=null,gM=null,gMu=null,mu=null,playing=false;
function ensure(){
  if(!C){
    const A=window.AudioContext||window.webkitAudioContext; if(!A) return null;
    C=new A();
    gM=C.createGain();gM.gain.value=.9;gM.connect(C.destination);
    gMu=C.createGain();gMu.gain.value=.12;gMu.connect(C.destination);
  }
  return C;
}
function resume(){ const c=ensure(); if(c&&c.state==='suspended') return c.resume(); return Promise.resolve(); }
function beep(f=480,d=.07){ const c=ensure(); if(!c) return; resume(); const o=c.createOscillator(), g=c.createGain(); o.type='triangle'; o.frequency.value=f; o.connect(g); g.connect(gM); g.gain.setValueAtTime(.0001,c.currentTime); g.gain.exponentialRampToValueAtTime(.2,c.currentTime+.01); g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+d); o.start(); o.stop(c.currentTime+d); }
function startMusic(){ if(playing) return; const c=ensure(); if(!c) return; resume().then(()=>{
  mu=C.createGain(); mu.gain.value=.0001; mu.connect(gMu);
  const root=196, tones=[root, root*5/4, root*3/2, root*15/8];
  tones.forEach((f,i)=>{ const o=C.createOscillator(); o.type='sine'; o.frequency.value=f; const g=C.createGain(); g.gain.value=.0002; o.connect(g); g.connect(mu); o.start(); const l=C.createOscillator(), lg=C.createGain(); l.type='sine'; l.frequency.value=.04+i*.02; lg.gain.value=18; l.connect(lg); lg.connect(o.frequency); l.start(); });
  mu.gain.exponentialRampToValueAtTime(.35,C.currentTime+1.4); playing=true;
});
}
function toggle(on){ const c=ensure(); if(!c) return; resume(); if(on){ startMusic(); } else if(playing&&mu){ mu.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.5); setTimeout(()=>{try{mu.disconnect();}catch{} mu=null; playing=false;},650); }}
document.addEventListener('pointerdown', ()=>{ const c=ensure(); if(!c) return; resume(); if(ui.music.checked) startMusic(); }, {once:true});
return { sfx:{move:()=>beep(520,.06), cap:()=>{beep(220,.06); setTimeout(()=>beep(320,.08),60)}, sel:()=>beep(760,.04)}, music:toggle };
})();

// ==== Логика доски (клиентская копия) ====
function initBoard(){ state.board=Array.from({length:SIZE},(_,r)=>Array.from({length:SIZE},(_,c)=>{ if((r+c)%2===0) return E; if(r<3) return B; if(r>4) return W; return E; }));}
function clone(b){return b.map(r=>r.slice());}
const isW=p=>p===W||p===WK, isB=p=>p===B||p===BK, isK=p=>p===WK||p===BK, inB=(r,c)=>r>=0&&r<SIZE&&c>=0&&c<SIZE;

function genMoves(board,side){const caps=[],moves=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=board[r][c];if(p===E)continue; if(side===W&&!isW(p))continue; if(side===B&&!isB(p))continue; const ms=movesForPiece(board,r,c,p,side===W); ms.forEach(m=>(m.caps.length?caps:moves).push(m));} if(caps.length){const max=Math.max(...caps.map(m=>m.caps.length));return caps.filter(m=>m.caps.length===max);} return moves;}
function movesForPiece(board,r,c,p,meW){const dirs=[[-1,-1],[-1,1],[1,-1],[1,1]],out=[];function genCap(brd,cr,cc,piece,accCaps,accPath){let any=false;const res=[];const en=meW?[B,BK]:[W,WK];if(isK(piece)){for(const[dr,dc]of dirs){let tr=cr+dr,tc=cc+dc;while(inB(tr,tc)&&brd[tr][tc]===E){tr+=dr;tc+=dc;}if(inB(tr,tc)&&en.includes(brd[tr][tc])){const er=tr,ec=tc,ep=brd[tr][tc];tr+=dr;tc+=dc;while(inB(tr,tc)&&brd[tr][tc]===E){const nb=clone(brd);nb[er][ec]=E;nb[cr][cc]=E;nb[tr][tc]=piece;const r2=genCap(nb,tr,tc,piece,accCaps.concat([[er,ec,ep]]),accPath.concat([[tr,tc]]));if(r2.length){any=true;res.push(...r2);}else{any=true;res.push({from:accPath[0],to:[tr,tc],caps:accCaps.concat([[er,ec,ep]]),path:accPath.concat([[tr,tc]]),promote:false});}tr+=dr;tc+=dc;}}} }else{for(const[dr,dc]of dirs){const mr=cr+dr,mc=cc+dc,lr=cr+2*dr,lc=cc+2*dc;const enSet=meW?[B,BK]:[W,WK];if(inB(lr,lc)&&inB(mr,mc)&&enSet.includes(brd[mr][mc])&&brd[lr][lc]===E){const nb=clone(brd);const ep=brd[mr][mc];nb[mr][mc]=E;nb[cr][cc]=E;let piece2=piece,prom=(meW&&lr===0)||(!meW&&lr===SIZE-1);if(prom)piece2=meW?WK:BK;nb[lr][lc]=piece2;const r2=genCap(nb,lr,lc,piece2,accCaps.concat([[mr,mc,ep]]),accPath.concat([[lr,lc]]));if(r2.length){any=true;res.push(...r2);}else{any=true;res.push({from:accPath[0],to:[lr,lc],caps:accCaps.concat([[mr,mc,ep]]),path:accPath.concat([[lr,lc]]),promote:prom});}}}} return any?res:[];} const caps=genCap(board,r,c,p,[],[[r,c]]); if(caps.length)return caps; if(isK(p)){for(const[dr,dc]of dirs){let tr=r+dr,tc=c+dc;while(inB(tr,tc)&&board[tr][tc]===E){out.push({from:[r,c],to:[tr,tc],caps:[],path:[[r,c],[tr,tc]],promote:false});tr+=dr;tc+=dc;}}}else{const fwd=meW?-1:1;for(const[dr,dc]of[[fwd,-1],[fwd,1]]){const nr=r+dr,nc=c+dc;if(inB(nr,nc)&&board[nr][nc]===E){const prom=(meW&&nr===0)||(!meW&&nr===SIZE-1);out.push({from:[r,c],to:[nr,nc],caps:[],path:[[r,c],[nr,nc]],promote:prom});}}} return out;}
function applyMove(board,mv){const nb=clone(board);const[fr,fc]=mv.from,[tr,tc]=mv.to;const p=nb[fr][fc];nb[fr][fc]=E;mv.caps.forEach(([cr,cc])=>nb[cr][cc]=E);nb[tr][tc]=mv.promote?( (p===W||p===WK)?WK:BK ):p;return nb;}

// ==== Рендер ====
function draw(){const Wc=cv.width,Hc=cv.height,S=Wc/8;ctx.clearRect(0,0,Wc,Hc);for(let r=0;r<8;r++)for(let c=0;c<8;c++){const dark=(r+c)%2===1;ctx.fillStyle=dark?'#6f4a2b':'#caa772';ctx.fillRect(c*S,r*S,S,S);ctx.fillStyle='rgba(0,0,0,.12)';ctx.fillRect(c*S,r*S,S,S);} if((state.hints||state.selected)&&state.legal.length){for(const m of state.legal){const[tr,tc]=m.to;ctx.save();ctx.translate((tc+.5)*S,(tr+.5)*S);ctx.fillStyle=m.caps.length?'rgba(251,113,133,.65)':'rgba(125,211,252,.55)';ctx.beginPath();ctx.arc(0,0,S*0.18,0,Math.PI*2);ctx.fill();ctx.restore();}} if(state.selected){const[sr,sc]=state.selected;ctx.lineWidth=S*0.08;ctx.strokeStyle='#7dd3fc';ctx.strokeRect(sc*S+S*0.08,sr*S+S*0.08,S*0.84,S*0.84);} for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=state.board[r][c];if(p===E)continue;const x=(c+.5)*S,y=(r+.5)*S,rad=S*0.42;const grad=ctx.createRadialGradient(x-rad*0.3,y-rad*0.3,rad*0.2,x,y,rad);if(p===W||p===WK){grad.addColorStop(0,'#fff');grad.addColorStop(.6,'#e6d8bf');grad.addColorStop(1,'#caa772');} else {grad.addColorStop(0,'#8c2b2b');grad.addColorStop(.6,'#5a1717');grad.addColorStop(1,'#2b0b0b');} ctx.fillStyle=grad;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill(); if(p===WK||p===BK){ctx.font=`${S*0.36}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('👑',x,y+1);}}}
function mvStr(m){if(!m)return'';const[fr,fc]=m.from,[tr,tc]=m.to;const cap=m.caps.length?'x':'-';return `${String.fromCharCode(97+fc)}${8-fr}${cap}${String.fromCharCode(97+tc)}${8-tr}`;}
function renderMoves(){ui.moves.innerHTML='';for(let i=0;i<state.record.length;i+=2){const n=(i/2|0)+1,w=state.record[i],b=state.record[i+1];const row=document.createElement('div');const num=document.createElement('b');num.textContent=n+'.';row.appendChild(num);const ws=document.createElement('span');ws.textContent=mvStr(w);if(i===state.curPly)ws.className='cur';row.appendChild(ws);if(b){const bs=document.createElement('span');bs.textContent=mvStr(b);if(i+1===state.curPly)bs.className='cur';row.appendChild(bs);}ui.moves.appendChild(row);}}

// ==== UI ====
function updateUI(){ui.turn.textContent= state.turn===W ? 'Вы' : (state.mode==='ai'?'Бот': state.mode==='online'?'Соперник':'Игрок 2'); let w=0,b=0; for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=state.board[r][c]; if(p===W||p===WK)w++; else if(p===B||p===BK)b++;} ui.score.textContent=`${w} / ${b}`; draw(); renderMoves();}

function onCanvasClick(evt){
  if(state.mode==='online' && state.myColor && state.turn!==(state.myColor==='W'?W:B))return;
  const rect=cv.getBoundingClientRect();
  const x=(evt.touches?evt.touches[0].clientX:evt.clientX)-rect.left;
  const y=(evt.touches?evt.touches[0].clientY:evt.clientY)-rect.top;
  const c=Math.floor(x/rect.width*8), r=Math.floor(y/rect.height*8);
  const p=state.board[r][c];
  if(state.selected){
    const m=state.legal.find(m=>m.to[0]===r&&m.to[1]===c);
    if(m){ return performMove(m); }
  }
  const side=(state.turn===W);
  if((side&&(p===W||p===WK))||(!side&&(p===B||p===BK))){
    const legal=genMoves(state.board,state.turn).filter(m=>m.from[0]===r&&m.from[1]===c);
    if(legal.length){
      state.selected=[r,c];
      state.legal=legal;
      if(state.sfx) AudioKit.sfx.sel();
    }else{
      state.selected=null;
      state.legal=[];
    }
  }else{
    state.selected=null;
    state.legal=[];
  }
  draw();
}

function animateMove(path,onDone){const S=cv.width/8;const[sr,sc]=path[0];let x0=(sc+.5)*S,y0=(sr+.5)*S;let step=1;const piece=state.board[sr][sc];function frame(){draw();const[tr,tc]=path[step];const x1=(tc+.5)*S,y1=(tr+.5)*S;const t=0.18;const dx=(x1-x0)*t,dy=(y1-y0)*t;x0+=dx;y0+=dy;const near=Math.hypot(x1-x0,y1-y0)<1.5;const rad=S*0.42;const grad=ctx.createRadialGradient(x0-rad*0.3,y0-rad*0.3,rad*0.2,x0,y0,rad);if(piece===W||piece===WK){grad.addColorStop(0,'#fff');grad.addColorStop(.6,'#e6d8bf');grad.addColorStop(1,'#caa772');} else {grad.addColorStop(0,'#8c2b2b');grad.addColorStop(.6,'#5a1717');grad.addColorStop(1,'#2b0b0b');} ctx.fillStyle=grad;ctx.beginPath();ctx.arc(x0,y0,rad,0,Math.PI*2);ctx.fill(); if(piece===WK||piece===BK){ctx.font=`${S*0.36}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('👑',x0,y0+1);} if(near){step++; if(step>=path.length){onDone();return;}} requestAnimationFrame(frame);} requestAnimationFrame(frame);}

function performMove(mv){ if(state.mode==='online'){ state.selected=null; state.legal=[]; send({type:'move',move:mv}); return; }
  state.history.push({board:clone(state.board),turn:state.turn});
  state.record=state.record.slice(0,state.curPly+1); state.record.push(mv); state.curPly++;
  const snd = mv.caps.length? AudioKit.sfx.cap:AudioKit.sfx.move;
  animateMove(mv.path, ()=>{ state.board=applyMove(state.board,mv); state.turn=(state.turn===W?B:W); state.selected=null; state.legal=[]; if(state.sfx)snd(); updateUI();
    if(state.mode==='ai' && state.turn===B){ setTimeout(()=>{ const mvb=bestMoveFor(B); if(mvb) performMove(mvb); }, 50); }
  });
}
function undoMove(){ if(state.mode==='online')return; const last=state.history.pop(); if(!last) return; state.board=last.board; state.turn=last.turn; if(state.record.length){state.record.pop(); state.curPly=Math.max(-1,state.curPly-1);} state.selected=null; state.legal=[]; updateUI();}

// ==== Оценка и ИИ ====
function evaluate(b){ let s=0; for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c]; if(p===E)continue; s+= (p===W?1:p===WK?3: p===B?-1: p===BK?-3:0);} s+=0.05*(genMoves(b,W).length-genMoves(b,B).length); return s;}
function minimax(b,side,d,a,beta){ if(d===0) return {score:evaluate(b)}; const ms=genMoves(b,side); if(!ms.length) return {score: side===W? -999:999}; let best=null; if(side===W){let bs=-Infinity; for(const m of ms){const r=minimax(applyMove(b,m),B,d-1,a,beta); if(r.score>bs){bs=r.score; best={move:m,score:bs}} a=Math.max(a,bs); if(beta<=a)break;} } else {let bs=Infinity; for(const m of ms){const r=minimax(applyMove(b,m),W,d-1,a,beta); if(r.score<bs){bs=r.score; best={move:m,score:bs}} beta=Math.min(beta,bs); if(beta<=a)break;} } return best||{score:evaluate(b)};}
function bestMoveFor(side){ const d=[1,3,5,6][+ui.level.value]||3; return (minimax(state.board,side,d,-Infinity,Infinity).move)||null;}

// ==== Хинты ====
function showBestMoveHint(){ const side = state.mode==='ai' ? W : state.turn; const mv = bestMoveFor(side); if(!mv)return; state.selected=mv.from.slice(); state.legal=[mv]; draw(); }

// ==== Canvas resize ====
function fitCanvas(){ const box=cv.parentElement.getBoundingClientRect(); const size=Math.min(box.width, box.height||box.width); const scale=window.devicePixelRatio||1; cv.width=Math.round(size*scale); cv.height=Math.round(size*scale); cv.style.height=size+'px'; cv.style.width=size+'px'; draw(); }
new ResizeObserver(fitCanvas).observe(cv.parentElement);
window.addEventListener('orientationchange', ()=> setTimeout(fitCanvas,150));

// ==== Online WS ====
function connect(){ if(state.ws && state.ws.readyState===1) return; const ws=new WebSocket(WS_URL); state.ws=ws; ws.onopen=()=>{ const initData=tg?.initData||''; send({type:'auth',initData}); }; ws.onmessage=ev=>{ const msg=JSON.parse(ev.data); switch(msg.type){ case 'auth_ok': ui.status.textContent='Онлайн: готово'; break; case 'queued': ui.status.textContent=`Поиск матча (ставка ${msg.stake})…`; break; case 'unqueued': ui.status.textContent='Поиск отменён'; break; case 'joined': state.roomId=msg.room.id; state.myColor=msg.room.color; ui.roomId.textContent=state.roomId; ui.myColor.textContent=state.myColor; ui.status.textContent='Комната создана/вход выполнен'; break; case 'start': ui.status.textContent='Матч начался'; break; case 'state': state.board=msg.board; state.turn=(msg.turn==='W'?W:B); ui.roomId.textContent=msg.roomId; draw(); break; case 'end': ui.status.textContent=`Игра окончена. Победил: ${msg.winner}`; break; case 'error': ui.status.textContent=`Ошибка: ${msg.error}`; break; } }; ws.onclose=()=>{ ui.status.textContent='Отключено'; }; }
function send(o){ if(state.ws?.readyState===1) state.ws.send(JSON.stringify(o)); }

ui.find.addEventListener('click',()=>{ state.mode='online'; ui.mode.value='online'; connect(); const stake=Number(ui.stake.value)||0; send({type:'find_match',stake}); });
ui.leave.addEventListener('click',()=>{ if(state.ws) send({type:'leave_room'}); state.roomId=null; state.myColor=null; ui.roomId.textContent='—'; ui.myColor.textContent='—'; ui.status.textContent='Вышли из комнаты'; });
ui.joinById.addEventListener('click',()=>{ const roomId=ui.roomInput.value.trim(); if(!roomId) return; state.mode='online'; ui.mode.value='online'; connect(); send({type:'join_room',roomId,color:'auto'}); });

ui.mode.addEventListener('change',()=>{ state.mode=ui.mode.value; ui.status.textContent= state.mode==='online'?'Онлайн-режим':'Локальный режим'; updateUI(); });
ui.level.addEventListener('change',()=> updateUI());
ui.music.addEventListener('change',e=> AudioKit.music(e.target.checked));
ui.sfx.addEventListener('change',e=> state.sfx=!!e.target.checked);
ui.hints.addEventListener('change',e=>{ state.hints=!!e.target.checked; draw(); });
ui.hintOnce.addEventListener('click',()=> showBestMoveHint());
ui.newBtn.addEventListener('click',()=>{ initBoard(); state.turn=W; state.history=[]; state.record=[]; state.curPly=-1; state.selected=null; state.legal=[]; updateUI(); });
ui.undo.addEventListener('click',()=> undoMove());
cv.addEventListener('click', onCanvasClick, {passive:true});
cv.addEventListener('touchstart', onCanvasClick, {passive:true});

// ==== Старт ====
initBoard(); updateUI(); fitCanvas();
