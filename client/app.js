// Telegram
const tg = window.Telegram?.WebApp; tg?.expand(); tg?.ready();

// WS URL
const WS_URL = (location.origin.replace('http','ws')) + '/ws';

// ==== Тема и настройки ====
const root = document.documentElement;
const settings = JSON.parse(localStorage.getItem('sc_settings')||'{}');
function applyTheme(t){ t==='light' ? root.classList.add('light') : root.classList.remove('light'); }
applyTheme(settings.theme || (window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'));
function saveSettings(){ localStorage.setItem('sc_settings', JSON.stringify({
  theme: root.classList.contains('light')?'light':'dark',
  level: ui.level.value,
  music: ui.music.checked,
  sfx: ui.sfx.checked,
  hints: ui.hints.checked
})); }

// ==== Константы ====
const SIZE=8,E=0,W=1,B=2,WK=3,BK=4;
const MODE_AI='ai', MODE_HOT='hotseat', MODE_ON='online';

// ==== Состояние ====
const state={
  board:[], turn:W, history:[], record:[], curPly:-1,
  selected:null, legal:[], mode:MODE_AI,
  sfx: settings.sfx!==undefined?settings.sfx:true,
  hints: settings.hints||false,
  drag:null, anim:null,
  ws:null, roomId:null, myColor:null,
  hintOnce:false
};

// ==== DOM ====
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const ui={
  mode: $('#mode'), level: $('#level'), stake: $('#stake'),
  find: $('#find'), leave: $('#leave'),
  music: $('#music'), sfx: $('#sfx'), hints: $('#hints'),
  hintOnce: $('#hintOnce'), newBtn: $('#new'), undo: $('#undo'),
  theme: $('#theme'),
  turn: $('#turn'), score: $('#score'), status: $('#status'),
  moves: $('#moves'), roomId: $('#roomId'), myColor: $('#myColor'),
  joinById: $('#joinById'), roomInput: $('#roomInput')
};
function $(s){return document.querySelector(s);}
ui.level.value = settings.level || '1';
ui.music.checked = settings.music!==undefined?settings.music:true;
ui.sfx.checked = state.sfx;
ui.hints.checked = state.hints;

// ==== Аудио ====
const AudioKit=(()=>{let C=null,gM=null,gMu=null,mu=null,playing=false;
function ensure(){
  if(!C){
    const A=window.AudioContext||window.webkitAudioContext; if(!A) return null;
    C=new A();
    gM=C.createGain(); gM.gain.value=.9; gM.connect(C.destination);
    gMu=C.createGain(); gMu.gain.value=.12; gMu.connect(C.destination);
  }
  return C;
}
function resume(){ const c=ensure(); if(c&&c.state==='suspended') return c.resume(); return Promise.resolve(); }
function beep(f=480,d=.07){ const c=ensure(); if(!c) return; resume(); const o=c.createOscillator(), g=c.createGain(); o.type='triangle'; o.frequency.value=f; o.connect(g); g.connect(gM); g.gain.setValueAtTime(.0001,c.currentTime); g.gain.exponentialRampToValueAtTime(.2,c.currentTime+.01); g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+d); o.start(); o.stop(c.currentTime+d); }
function startMusic(){ if(playing) return; const c=ensure(); if(!c) return; resume().then(()=>{
  mu=C.createGain(); mu.gain.value=.0001; mu.connect(gMu);
  const root=196, tones=[root, root*5/4, root*3/2, root*15/8];
  tones.forEach((f,i)=>{
    const o=C.createOscillator(); o.type='sine'; o.frequency.value=f; const g=C.createGain(); g.gain.value=.0002; o.connect(g); g.connect(mu); o.start();
    const l=C.createOscillator(), lg=C.createGain(); l.type='sine'; l.frequency.value=.04+i*.02; lg.gain.value=18; l.connect(lg); lg.connect(o.frequency); l.start();
  });
  mu.gain.exponentialRampToValueAtTime(.35,C.currentTime+1.4);
  playing=true;
}); }
function toggle(on){ const c=ensure(); if(!c) return; resume(); if(on){ startMusic(); } else if(playing&&mu){ mu.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.5); setTimeout(()=>{try{mu.disconnect();}catch{} mu=null; playing=false;},650); }}
document.addEventListener('pointerdown', ()=>{ const c=ensure(); if(!c) return; resume(); if(ui.music.checked) startMusic(); }, {once:true});
return { sfx:{move:()=>beep(520,.06), cap:()=>{beep(220,.06); setTimeout(()=>beep(320,.08),60)}, sel:()=>beep(760,.04)}, music:toggle };
})();

// ==== Логика доски ====
function initBoard(){ state.board=Array.from({length:SIZE},(_,r)=>Array.from({length:SIZE},(_,c)=>{ if((r+c)%2===0) return E; if(r<3) return B; if(r>4) return W; return E; })); }
function clone(b){return b.map(r=>r.slice());}
const isW=p=>p===W||p===WK, isB=p=>p===B||p===BK, isK=p=>p===WK||p===BK, inB=(r,c)=>r>=0&&r<SIZE&&c>=0&&c<SIZE;
function genMoves(board,side){const caps=[],moves=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=board[r][c];if(p===E)continue; if(side===W&&!isW(p))continue; if(side===B&&!isB(p))continue; const ms=movesForPiece(board,r,c,p,side===W); ms.forEach(m=>((m.caps.length?caps:moves).push(m)));} if(caps.length){const max=Math.max(...caps.map(m=>m.caps.length));return caps.filter(m=>m.caps.length===max);} return moves;}
function movesForPiece(board,r,c,p,meW){const dirs=[[-1,-1],[-1,1],[1,-1],[1,1]],out=[];function genCap(brd,cr,cc,piece,accCaps,accPath){let any=false;const res=[];const en=meW?[B,BK]:[W,WK];if(isK(piece)){for(const[dr,dc]of dirs){let tr=cr+dr,tc=cc+dc;while(inB(tr,tc)&&brd[tr][tc]===E){tr+=dr;tc+=dc;}if(inB(tr,tc)&&en.includes(brd[tr][tc])){const er=tr,ec=tc,ep=brd[tr][tc];tr+=dr;tc+=dc;while(inB(tr,tc)&&brd[tr][tc]===E){const nb=clone(brd);nb[er][ec]=E;nb[cr][cc]=E;nb[tr][tc]=piece;const r2=genCap(nb,tr,tc,piece,accCaps.concat([[er,ec,ep]]),accPath.concat([[tr,tc]]));if(r2.length){any=true;res.push(...r2);}else{any=true;res.push({from:accPath[0],to:[tr,tc],caps:accCaps.concat([[er,ec,ep]]),path:accPath.concat([[tr,tc]]),promote:false});}tr+=dr;tc+=dc;}}} }else{for(const[dr,dc]of dirs){const mr=cr+dr,mc=cc+dc,lr=cr+2*dr,lc=cc+2*dc;const enSet=meW?[B,BK]:[W,WK];if(inB(lr,lc)&&inB(mr,mc)&&enSet.includes(brd[mr][mc])&&brd[lr][lc]===E){const nb=clone(brd);const ep=brd[mr][mc];nb[mr][mc]=E;nb[cr][cc]=E;let piece2=piece,prom=(meW&&lr===0)||(!meW&&lr===SIZE-1);if(prom)piece2=meW?WK:BK;nb[lr][lc]=piece2;const r2=genCap(nb,lr,lc,piece2,accCaps.concat([[mr,mc,ep]]),accPath.concat([[lr,lc]]));if(r2.length){any=true;res.push(...r2);}else{any=true;res.push({from:accPath[0],to:[lr,lc],caps:accCaps.concat([[mr,mc,ep]]),path:accPath.concat([[lr,lc]]),promote:prom});}}}} return any?res:[];} const caps=genCap(board,r,c,p,[],[[r,c]]); if(caps.length)return caps; if(isK(p)){for(const[dr,dc]of dirs){let tr=r+dr,tc=c+dc;while(inB(tr,tc)&&board[tr][tc]===E){out.push({from:[r,c],to:[tr,tc],caps:[],path:[[r,c],[tr,tc]],promote:false});tr+=dr;tc+=dc;}}}else{const fwd=meW?-1:1;for(const[dr,dc]of[[fwd,-1],[fwd,1]]){const nr=r+dr,nc=c+dc;if(inB(nr,nc)&&board[nr][nc]===E){const prom=(meW&&nr===0)||(!meW&&nr===SIZE-1);out.push({from:[r,c],to:[nr,nc],caps:[],path:[[r,c],[nr,nc]],promote:prom});}}} return out;}
function applyMove(board,mv){const nb=clone(board);const[fr,fc]=mv.from,[tr,tc]=mv.to;const p=nb[fr][fc];nb[fr][fc]=E;mv.caps.forEach(([cr,cc])=>nb[cr][cc]=E);nb[tr][tc]=mv.promote?( (p===W||p===WK)?WK:BK ):p;return nb;}

// ==== Рендер ====
const COLORS={};
function refreshColors(){const cs=getComputedStyle(root); COLORS.dark=cs.getPropertyValue('--tile-dark').trim(); COLORS.light=cs.getPropertyValue('--tile-light').trim(); COLORS.acc=cs.getPropertyValue('--accent').trim(); COLORS.cap=cs.getPropertyValue('--accent-2').trim();}
refreshColors();
root.addEventListener('transitionend',refreshColors);
function drawPiece(x,y,p,ghost=false){const S=cv.width/8,rad=S*0.42;const grad=ctx.createRadialGradient(x-rad*0.3,y-rad*0.3,rad*0.2,x,y,rad);if(p===W||p===WK){grad.addColorStop(0,'#fff');grad.addColorStop(1,'#d6c4a5');}else{grad.addColorStop(0,'#475569');grad.addColorStop(1,'#1e293b');}ctx.save();if(ghost)ctx.globalAlpha=.8;ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=rad*0.3;ctx.fillStyle=grad;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;if(p===WK||p===BK){ctx.font=`${S*.36}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('👑',x,y+1);}ctx.restore();}
function draw(){const Wc=cv.width,S=Wc/8;ctx.clearRect(0,0,Wc,Wc);for(let r=0;r<8;r++)for(let c=0;c<8;c++){const dark=(r+c)%2===1;const grad=ctx.createLinearGradient(c*S,r*S,(c+1)*S,(r+1)*S);if(dark){grad.addColorStop(0,COLORS.dark);grad.addColorStop(1,'#1f2738');}else{grad.addColorStop(0,COLORS.light);grad.addColorStop(1,'#d2c1a3');}ctx.fillStyle=grad;ctx.fillRect(c*S,r*S,S,S);}if((state.hints||state.hintOnce)&&state.legal.length){for(const m of state.legal){const[tr,tc]=m.to;ctx.save();ctx.translate((tc+.5)*S,(tr+.5)*S);ctx.fillStyle=(m.caps.length?COLORS.cap:COLORS.acc)+'aa';ctx.beginPath();ctx.arc(0,0,S*0.18,0,Math.PI*2);ctx.fill();ctx.restore();}}if(state.selected){const[sr,sc]=state.selected;ctx.lineWidth=S*0.08;ctx.strokeStyle=COLORS.acc;ctx.strokeRect(sc*S+S*0.08,sr*S+S*0.08,S*0.84,S*0.84);}for(let r=0;r<8;r++)for(let c=0;c<8;c++){if(state.anim && ((r===state.anim.from[0]&&c===state.anim.from[1])||(r===state.anim.to[0]&&c===state.anim.to[1]))) continue;const p=state.board[r][c];if(p===E)continue;drawPiece((c+.5)*S,(r+.5)*S,p);}if(state.anim){drawPiece(state.anim.x,state.anim.y,state.anim.piece);}if(state.drag){drawPiece(state.drag.x,state.drag.y,state.drag.piece,true);}state.hintOnce=false;}

// ==== Utility ====
function mvStr(m){if(!m)return'';const[fr,fc]=m.from,[tr,tc]=m.to;const cap=m.caps.length?'x':'-';return `${String.fromCharCode(97+fc)}${8-fr}${cap}${String.fromCharCode(97+tc)}${8-tr}`;}
function renderMoves(){ui.moves.innerHTML='';for(let i=0;i<state.record.length;i+=2){const n=(i/2|0)+1,w=state.record[i],b=state.record[i+1];const row=document.createElement('div');const num=document.createElement('b');num.textContent=n+'.';row.appendChild(num);const ws=document.createElement('span');ws.textContent=mvStr(w);if(i===state.curPly)ws.className='cur';row.appendChild(ws);if(b){const bs=document.createElement('span');bs.textContent=mvStr(b);if(i+1===state.curPly)bs.className='cur';row.appendChild(bs);}ui.moves.appendChild(row);}}
function updateUI(){ui.turn.textContent= state.turn===W ? 'Вы' : (state.mode==='ai'?'Бот': state.mode==='online'?'Соперник':'Игрок 2'); let w=0,b=0; for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=state.board[r][c]; if(p===W||p===WK)w++; else if(p===B||p===BK)b++;} ui.score.textContent=`${w} / ${b}`; draw(); renderMoves();}

// ==== Подсказки ====
function showBestMoveHint(){ const side = state.mode==='ai' ? W : state.turn; const mv = bestMoveFor(side); if(!mv)return; state.selected=mv.from.slice(); state.legal=[mv]; state.hintOnce=true; draw(); }

// ==== Анимация ====
function easeInOutCubic(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
function animateMove(path,piece,onDone){
  const S=cv.width/8;
  const [sr,sc]=path[0];
  state.anim={path,piece,idx:0,start:performance.now(),dur:0,x:(sc+.5)*S,y:(sr+.5)*S,from:path[0],to:path[path.length-1]};
  function segDur(i){const a=path[i],b=path[i+1];const dist=Math.hypot((b[1]-a[1]),(b[0]-a[0]))*S;return Math.min(220,dist/(S/150));}
  state.anim.dur=segDur(0);
  function step(now){
    const a=state.anim.path[state.anim.idx],b=state.anim.path[state.anim.idx+1];
    const t=Math.min(1,(now-state.anim.start)/state.anim.dur);
    const e=easeInOutCubic(t);
    state.anim.x=(a[1]+.5+(b[1]-a[1])*e)*S;
    state.anim.y=(a[0]+.5+(b[0]-a[0])*e)*S;
    draw();
    if(t<1){
      requestAnimationFrame(step);
    }else{
      state.anim.idx++;
      if(state.anim.idx>=state.anim.path.length-1){
        state.anim=null;
        onDone();
      }else{
        state.anim.start=now;
        state.anim.dur=segDur(state.anim.idx);
        requestAnimationFrame(step);
      }
    }
  }
  draw();
  requestAnimationFrame(step);
}

// ==== Управление ====
function pointerPos(evt){const rect=cv.getBoundingClientRect();return{ x:(evt.clientX-rect.left)*(cv.width/rect.width), y:(evt.clientY-rect.top)*(cv.height/rect.height) };
}
function cellFromPos(pos){return{r:Math.floor(pos.y/(cv.height/8)), c:Math.floor(pos.x/(cv.width/8))};}
let startPos=null;
function onPointerDown(e){if(state.mode==='online'&&state.myColor&&state.turn!==(state.myColor==='W'?W:B))return; startPos=pointerPos(e);const {r,c}=cellFromPos(startPos);const p=state.board[r]?.[c];const side=state.turn===W;if((side&&(p===W||p===WK))||(!side&&(p===B||p===BK))){state.selected=[r,c];state.legal=genMoves(state.board,state.turn).filter(m=>m.from[0]===r&&m.from[1]===c);if(state.sfx)AudioKit.sfx.sel();state.drag={from:[r,c],piece:p,x:startPos.x,y:startPos.y};}draw();document.addEventListener('pointermove',onPointerMove);document.addEventListener('pointerup',onPointerUp);state.hintOnce=false;}
function onPointerMove(e){if(!state.drag)return;const pos=pointerPos(e);state.drag.x=pos.x;state.drag.y=pos.y;draw();}
function onPointerUp(e){document.removeEventListener('pointermove',onPointerMove);document.removeEventListener('pointerup',onPointerUp);const pos=pointerPos(e);const moved=startPos&&Math.hypot(pos.x-startPos.x,pos.y-startPos.y)>8;if(state.drag&&moved){const {r,c}=cellFromPos(pos);const mv=state.legal.find(m=>m.to[0]===r&&m.to[1]===c);if(mv){performMove(mv);}else{state.drag=null;draw();}}else{const {r,c}=cellFromPos(pos);onCellClick(r,c);}state.drag=null;startPos=null;}
cv.addEventListener('pointerdown',onPointerDown);
function onCellClick(r,c){if(state.selected){const m=state.legal.find(m=>m.to[0]===r&&m.to[1]===c);if(m){performMove(m);return;}}const p=state.board[r][c];const side=state.turn===W;if((side&&(p===W||p===WK))||(!side&&(p===B||p===BK))){state.selected=[r,c];state.legal=genMoves(state.board,state.turn).filter(m=>m.from[0]===r&&m.from[1]===c);if(state.sfx)AudioKit.sfx.sel();}else{state.selected=null;state.legal=[];}draw();}

// ==== Ходы ====
function performMove(mv){
  if(state.mode==='online'){ state.selected=null; state.legal=[]; send({type:'move',move:mv}); return; }
  state.history.push({board:clone(state.board),turn:state.turn});
  state.record=state.record.slice(0,state.curPly+1);
  state.record.push(mv);
  state.curPly++;
  const snd = mv.caps.length? AudioKit.sfx.cap:AudioKit.sfx.move;
  const piece = state.board[mv.from[0]][mv.from[1]];
  state.board=applyMove(state.board,mv);
  state.turn=(state.turn===W?B:W);
  state.selected=null; state.legal=[];
  animateMove(mv.path,piece,()=>{
    if(state.sfx)snd();
    updateUI();
    if(state.mode==='ai' && state.turn===B){
      setTimeout(()=>{ const mvb=bestMoveFor(B); if(mvb) performMove(mvb); }, 50);
    }
  });
}
function undoMove(){ if(state.mode==='online')return; const last=state.history.pop(); if(!last) return; state.board=last.board; state.turn=last.turn; if(state.record.length){state.record.pop(); state.curPly=Math.max(-1,state.curPly-1);} state.selected=null; state.legal=[]; updateUI();}

// ==== ИИ ====
function evaluate(b){ let s=0; for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c]; if(p===E)continue; s+= (p===W?1:p===WK?3: p===B?-1: p===BK?-3:0);} s+=0.05*(genMoves(b,W).length-genMoves(b,B).length); return s;}
function minimax(b,side,d,a,beta){ if(d===0) return {score:evaluate(b)}; const ms=genMoves(b,side); if(!ms.length) return {score: side===W? -999:999}; let best=null; if(side===W){let bs=-Infinity; for(const m of ms){const r=minimax(applyMove(b,m),B,d-1,a,beta); if(r.score>bs){bs=r.score; best={move:m,score:bs}} a=Math.max(a,bs); if(beta<=a)break;} } else {let bs=Infinity; for(const m of ms){const r=minimax(applyMove(b,m),W,d-1,a,beta); if(r.score<bs){bs=r.score; best={move:m,score:bs}} beta=Math.min(beta,bs); if(beta<=a)break;} } return best||{score:evaluate(b)};}
function bestMoveFor(side){ const d=[1,3,5,6][+ui.level.value]||3; return (minimax(state.board,side,d,-Infinity,Infinity).move)||null;}

// ==== Canvas resize ====
function fitCanvas(){ const box=cv.parentElement.getBoundingClientRect(); const size=Math.min(box.width, box.height||box.width); const scale=window.devicePixelRatio||1; cv.width=Math.round(size*scale); cv.height=Math.round(size*scale); cv.style.height=size+'px'; cv.style.width=size+'px'; draw(); }
new ResizeObserver(fitCanvas).observe(cv.parentElement); window.addEventListener('orientationchange', ()=> setTimeout(fitCanvas,150));

// ==== Online WS ====
function connect(){ if(state.ws && state.ws.readyState===1) return; const ws=new WebSocket(WS_URL); state.ws=ws; ws.onopen=()=>{ const initData=tg?.initData||''; send({type:'auth',initData}); }; ws.onmessage=ev=>{ const msg=JSON.parse(ev.data); switch(msg.type){ case 'auth_ok': ui.status.textContent='Онлайн: готово'; break; case 'queued': ui.status.textContent=`Поиск матча (ставка ${msg.stake})…`; break; case 'unqueued': ui.status.textContent='Поиск оменён'; break; case 'joined': state.roomId=msg.room.id; state.myColor=msg.room.color; ui.roomId.textContent=state.roomId; ui.myColor.textContent=state.myColor; ui.status.textContent='Комната создана/вход выполнен'; break; case 'start': ui.status.textContent='Матч начался'; break; case 'state': state.board=msg.board; state.turn=(msg.turn==='W'?W:B); ui.roomId.textContent=msg.roomId; draw(); break; case 'end': ui.status.textContent=`Игра окончена. Победил: ${msg.winner}`; break; case 'error': ui.status.textContent=`Ошибка: ${msg.error}`; break; } }; ws.onclose=()=>{ ui.status.textContent='Отключено'; }; }
function send(o){ if(state.ws?.readyState===1) state.ws.send(JSON.stringify(o)); }

// ==== События UI ====
ui.find.addEventListener('click',()=>{ state.mode='online'; ui.mode.value='online'; connect(); const stake=Number(ui.stake.value)||0; send({type:'find_match',stake}); });
ui.leave.addEventListener('click',()=>{ if(state.ws) send({type:'leave_room'}); state.roomId=null; state.myColor=null; ui.roomId.textContent='—'; ui.myColor.textContent='—'; ui.status.textContent='Вышли из комнаты'; });
ui.joinById.addEventListener('click',()=>{ const roomId=ui.roomInput.value.trim(); if(!roomId) return; state.mode='online'; ui.mode.value='online'; connect(); send({type:'join_room',roomId,color:'auto'}); });
ui.mode.addEventListener('change',()=>{ state.mode=ui.mode.value; ui.status.textContent= state.mode==='online'?'Онлайн-режим':'Локальный режим'; updateUI(); });
ui.level.addEventListener('change',()=>{ saveSettings(); updateUI(); });
ui.music.addEventListener('change',e=>{ AudioKit.music(e.target.checked); saveSettings(); });
ui.sfx.addEventListener('change',e=>{ state.sfx=!!e.target.checked; saveSettings(); });
ui.hints.addEventListener('change',e=>{ state.hints=!!e.target.checked; saveSettings(); draw(); });
ui.hintOnce.addEventListener('click',()=>{ showBestMoveHint(); });
ui.newBtn.addEventListener('click',()=>{ initBoard(); state.turn=W; state.history=[]; state.record=[]; state.curPly=-1; state.selected=null; state.legal=[]; updateUI(); });
ui.undo.addEventListener('click',()=> undoMove());
ui.theme.addEventListener('click',()=>{ root.classList.toggle('light'); refreshColors(); saveSettings(); draw(); });

// ==== Старт ====
initBoard(); updateUI(); fitCanvas();
