const SIZE = 8;
const DIRS = [[1,1],[-1,1],[1,-1],[-1,-1]];
const LIGHT = 0, DARK = 1;

function inside(x,y){ return x>=0 && x<SIZE && y>=0 && y<SIZE; }
function cloneBoard(b){ return b.map(r=>r.map(p=>p?{...p}:null)); }
function Piece(c,k){ return {c,k}; }

function movesFor(b,x,y,mustCap){
  const p=b[y][x]; if(!p) return [];
  const color=p.c, enemy=1-color; const res=[];
  function push(path,captures){ res.push({from:{x,y}, to:path[path.length-1], path, captures:[...captures], piece:p}); }
  if(!mustCap){
    if(!p.k){
      const dir=(color===LIGHT?-1:1);
      for(const dx of [-1,1]){
        const nx=x+dx, ny=y+dir;
        if(inside(nx,ny) && !b[ny][nx]) push([{x:nx,y:ny}],[]);
      }
    }else{
      for(const [dx,dy] of DIRS){
        let nx=x+dx, ny=y+dy;
        while(inside(nx,ny) && !b[ny][nx]){ push([{x:nx,y:ny}],[]); nx+=dx; ny+=dy; }
      }
    }
  }
  function searchCap(cx,cy,board,caps,path,becameKing){
    let found=false;
    if(!p.k && !becameKing){
      for(const [dx,dy] of DIRS){
        const mx=cx+dx, my=cy+dy, lx=cx+2*dx, ly=cy+2*dy;
        if(!inside(lx,ly)||!inside(mx,my)) continue;
        if(board[my][mx] && board[my][mx].c===enemy && !board[ly][lx]){
          const nb=cloneBoard(board);
          nb[my][mx]=null; nb[cy][cx]=null; nb[ly][lx]=Piece(color,false);
          let became = becameKing || (color===LIGHT? ly===0 : ly===SIZE-1);
          if(became) nb[ly][lx].k=true;
          searchCap(lx,ly,nb,[...caps,{x:mx,y:my}], [...path,{x:lx,y:ly}], became);
          found=true;
        }
      }
    }else{
      for(const [dx,dy] of DIRS){
        let nx=cx+dx, ny=cy+dy; let met=null;
        while(inside(nx,ny)){
          if(!met && board[ny][nx]==null){ nx+=dx; ny+=dy; continue; }
          if(!met && board[ny][nx] && board[ny][nx].c===enemy){ met={x:nx,y:ny}; nx+=dx; ny+=dy; continue; }
          if(met && board[ny] && board[ny][nx]==null){
            const nb=cloneBoard(board);
            nb[met.y][met.x]=null; nb[cy][cx]=null; nb[ny][nx]=Piece(color,true);
            searchCap(nx,ny,nb,[...caps,{x:met.x,y:met.y}], [...path,{x:nx,y:ny}], true);
            found=true; nx+=dx; ny+=dy; continue;
          }
          break;
        }
      }
    }
    if(!found && caps.length){ push(path,caps); }
  }
  searchCap(x,y,b,[],[],false);
  if(res.some(m=>m.captures.length)) return res.filter(m=>m.captures.length>0);
  return res;
}

function allMoves(b,turn,mustCap){
  const ms=[];
  for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++){
    const p=b[y][x]; if(p && p.c===turn){ const list=movesFor(b,x,y,mustCap); for(const m of list) ms.push({...m, from:{x,y}}); }
  }
  if(mustCap){
    const max = ms.reduce((a,m)=>Math.max(a,m.captures.length),0);
    if(max>0) return ms.filter(m=>m.captures.length===max);
    return allMoves(b, turn, false);
  }
  return ms;
}

export function getLegalMoves(board, fromCell){
  const [x,y]=fromCell; // assuming [x,y]
  const piece = board[y]?.[x]; if(!piece) return [];
  const moves = allMoves(board, piece.c, true);
  return moves.filter(m=>m.from.x===x && m.from.y===y).map(m=>m.to);
}
