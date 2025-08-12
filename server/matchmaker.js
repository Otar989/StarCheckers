import { initialBoard, validateMove, applyMove, whoHasMoves } from './game.js';

// Matchmaker / game coordinator
export function createMatchmaker() {
  // rooms: roomId -> { id, players:{W:ws,B:ws}, board, turn }
  const rooms = new Map();
  // queue: stake -> [ws, ws, ...]
  const queue = new Map();

  function send(ws, obj) {
    try { ws.send(JSON.stringify(obj)); } catch (_) {}
  }

  function matchPlayers(stake) {
    const q = queue.get(stake);
    if (!q || q.length < 2) return;
    const [a, b] = q.splice(0, 2);
    if (q.length === 0) queue.delete(stake);

    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const board = initialBoard();
    const turn = 'W';
    const colors = Math.random() < 0.5 ? ['W', 'B'] : ['B', 'W'];
    const room = { id: roomId, players: { [colors[0]]: a, [colors[1]]: b }, board, turn };
    rooms.set(roomId, room);

    [a, b].forEach((p, i) => {
      p.roomId = roomId;
      p.color = colors[i];
      send(p, { type: 'joined', room: { id: roomId, color: colors[i] } });
    });

    [a, b].forEach((p) => send(p, { type: 'start', roomId }));
    [a, b].forEach((p) => send(p, { type: 'state', roomId, board, turn }));
  }

  function removeFromQueue(ws) {
    for (const [stake, q] of queue) {
      const idx = q.indexOf(ws);
      if (idx >= 0) {
        q.splice(idx, 1);
        if (q.length === 0) queue.delete(stake);
        send(ws, { type: 'unqueued' });
        return true;
      }
    }
    return false;
  }

  function leaveRoom(ws) {
    const roomId = ws.roomId;
    if (!roomId) return false;
    const room = rooms.get(roomId);
    if (!room) return false;

    const color = ws.color;
    const oppColor = color === 'W' ? 'B' : 'W';
    const opp = room.players[oppColor];

    delete room.players[color];
    ws.roomId = null;
    ws.color = null;

    if (opp) {
      send(opp, { type: 'end', winner: oppColor });
      opp.roomId = null;
      opp.color = null;
    }

    rooms.delete(roomId);
    return true;
  }

  function handleFindMatch(ws, msg) {
    const stake = Number(msg.stake) || 0;
    if (!queue.has(stake)) queue.set(stake, []);
    const q = queue.get(stake);
    if (!q.includes(ws)) q.push(ws);
    ws.stake = stake;
    send(ws, { type: 'queued', stake });
    matchPlayers(stake);
  }

  function handleJoinRoom(ws, msg) {
    const { roomId, color = 'auto' } = msg;
    if (!roomId) {
      send(ws, { type: 'error', error: 'roomId required' });
      return;
    }
    let room = rooms.get(roomId);
    if (!room) {
      room = { id: roomId, players: {}, board: initialBoard(), turn: 'W' };
      rooms.set(roomId, room);
    }

    let c = color;
    if (c === 'auto') {
      if (!room.players['W']) c = 'W';
      else if (!room.players['B']) c = 'B';
      else {
        send(ws, { type: 'error', error: 'Room is full' });
        return;
      }
    }

    if (room.players[c]) {
      send(ws, { type: 'error', error: 'Color already taken' });
      return;
    }

    room.players[c] = ws;
    ws.roomId = room.id;
    ws.color = c;
    send(ws, { type: 'joined', room: { id: room.id, color: c } });

    if (room.players['W'] && room.players['B']) {
      const players = [room.players['W'], room.players['B']];
      players.forEach((p) => send(p, { type: 'start', roomId: room.id }));
      players.forEach((p) =>
        send(p, { type: 'state', roomId: room.id, board: room.board, turn: room.turn })
      );
    }
  }

  function handleMove(ws, msg) {
    const room = rooms.get(ws.roomId);
    if (!room) return;
    if ((room.turn === 'W' && ws.color !== 'W') || (room.turn === 'B' && ws.color !== 'B')) {
      send(ws, { type: 'error', error: 'Not your turn' });
      return;
    }
    const mv = msg.move;
    const side = ws.color === 'W' ? 'w' : 'b';
    if (!validateMove(room.board, mv, side)) {
      send(ws, { type: 'error', error: 'Invalid move' });
      return;
    }
    room.board = applyMove(room.board, mv);
    room.turn = room.turn === 'W' ? 'B' : 'W';
    const players = [room.players['W'], room.players['B']].filter(Boolean);
    players.forEach((p) =>
      send(p, { type: 'state', roomId: room.id, board: room.board, turn: room.turn })
    );

    const { white, black } = whoHasMoves(room.board);
    if (!white || !black) {
      const winner = !white ? 'B' : 'W';
      players.forEach((p) => send(p, { type: 'end', winner }));
      players.forEach((p) => {
        p.roomId = null;
        p.color = null;
      });
      rooms.delete(room.id);
    }
  }

  function onMessage(ws, msg) {
    switch (msg.type) {
      case 'find_match':
        handleFindMatch(ws, msg);
        break;
      case 'leave_room':
        if (!removeFromQueue(ws)) leaveRoom(ws);
        break;
      case 'join_room':
        handleJoinRoom(ws, msg);
        break;
      case 'move':
        handleMove(ws, msg);
        break;
      default:
        break;
    }
  }

  function onDisconnect(ws) {
    if (removeFromQueue(ws)) return;
    leaveRoom(ws);
  }

  return { onMessage, onDisconnect };
}

export default undefined;

