/**
 * @typedef {{x:number,y:number}} Coord
 * @typedef {{from:Coord,to:Coord,captures:Coord[],path:Coord[],promote?:boolean}} Move
 */

const DIRS = [
  {dx:1,dy:1}, {dx:-1,dy:1}, {dx:1,dy:-1}, {dx:-1,dy:-1}
];

function cloneBoard(b){return b.map(r=>r.slice());}
function inside(x,y){return x>=0&&x<8&&y>=0&&y<8;}
function isKing(p){return p==='W'||p==='B';}
function sideOf(p){return p && (p==='w'||p==='W'? 'w':'b');}
function opponent(side){return side==='w'?'b':'w';}

/**
 * Generate legal moves for side.
 * @param {string[][]} board
 * @param {'w'|'b'} side
 * @param {{force?:boolean}} options
 * @returns {Move[]}
 */
export function generateMoves(board, side, options={}){
  const force = options.force !== false;
  let captures=[]; let normals=[];
  for(let y=0;y<8;y++){
    for(let x=0;x<8;x++){
      const piece = board[y][x];
      if(!piece || sideOf(piece)!==side) continue;
      const from={x,y};
      const caps = captureMoves(board, from, piece);
      if(caps.length) captures.push(...caps);
      else normals.push(...normalMoves(board, from, piece, side));
    }
  }
  if(captures.length){
    let max=0; captures.forEach(m=>{if(m.captures.length>max)max=m.captures.length;});
    return captures.filter(m=>m.captures.length===max);
  }
  return force?[]:normals;
}

function normalMoves(board, from, piece, side){
  const moves=[];
  const dir = side==='w'?-1:1;
  for(const d of DIRS){
    if(!isKing(piece) && d.dy!==dir) continue;
    const x=from.x+d.dx, y=from.y+d.dy;
    if(inside(x,y) && !board[y][x]){
      let promote=false;
      if(piece==='w' && y===0) promote=true;
      if(piece==='b' && y===7) promote=true;
      moves.push({from,to:{x,y},captures:[],path:[{x,y}],promote});
    }
    if(isKing(piece)){
      let nx=from.x+d.dx, ny=from.y+d.dy;
      while(inside(nx,ny) && !board[ny][nx]){
        moves.push({from,to:{x:nx,y:ny},captures:[],path:[{x:nx,y:ny}]});
        nx+=d.dx; ny+=d.dy;
      }
    }
  }
  return moves;
}

function captureMoves(board, from, piece){
  const res=[];
  const visited=new Set();
  function explore(b,x,y,p,cap,path,promoted){
    let found=false;
    for(const d of DIRS){
      if(!isKing(p)){
        const mx=x+d.dx, my=y+d.dy, lx=x+2*d.dx, ly=y+2*d.dy;
        if(inside(lx,ly) && b[my] && sideOf(b[my][mx])===opponent(sideOf(p)) && !b[ly][lx]){
          const nb=cloneBoard(b);
          nb[y][x]=null; nb[my][mx]=null; nb[ly][lx]=p;
          let np=p; let promo=promoted;
          if(p==='w' && ly===0){np='W'; nb[ly][lx]=np; promo=true;}
          if(p==='b' && ly===7){np='B'; nb[ly][lx]=np; promo=true;}
          explore(nb,lx,ly,np,[...cap,{x:mx,y:my}],[...path,{x:lx,y:ly}],promo);
          found=true;
        }
      } else { // king
        let mx=x+d.dx, my=y+d.dy; let jumped=false;
        while(inside(mx,my)){
          if(!jumped){
            if(b[my][mx]==null){mx+=d.dx; my+=d.dy; continue;}
            if(sideOf(b[my][mx])!==opponent(sideOf(p))) break;
            jumped=true; mx+=d.dx; my+=d.dy; continue;
          } else {
            if(b[my][mx]) break;
            const nb=cloneBoard(b);
            nb[y][x]=null; nb[my-d.dy][mx-d.dx]=null; nb[my][mx]=p;
            explore(nb,mx,my,p,[...cap,{x:mx-d.dx,y:my-d.dy}],[...path,{x:mx,y:my}],promoted);
            found=true;
            mx+=d.dx; my+=d.dy;
          }
        }
      }
    }
    if(!found){
      res.push({from,to:{x,y},captures:cap,path:path,promote:promoted});
    }
  }
  explore(board,from.x,from.y,piece,[],[] ,false);
  return res.filter(m=>m.captures.length>0);
}
