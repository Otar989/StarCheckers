export function createMatchmaker() {
  // Authentication is handled at the WebSocket layer. The matchmaker accepts
  // both authenticated and anonymous players, so no extra verification is
  // performed here.
  const rooms = new Map();
  const queue = [];

  function onMessage(ws, msg) {
    if (msg.type === 'join') {
      if (!queue.includes(ws)) queue.push(ws);
      if (queue.length >= 2) {
        const [a, b] = queue.splice(0, 2);
        const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        rooms.set(roomId, [a, b]);
        a.send(
          JSON.stringify({ type: 'start', roomId, opponent: b.user })
        );
        b.send(
          JSON.stringify({ type: 'start', roomId, opponent: a.user })
        );
      }
    }
  }

  function onDisconnect(ws) {
    const idx = queue.indexOf(ws);
    if (idx >= 0) queue.splice(idx, 1);

    for (const [id, players] of rooms) {
      if (players.includes(ws)) {
        rooms.delete(id);
        players.forEach((p) => {
          if (p !== ws) {
            p.send(JSON.stringify({ type: 'opponent_disconnect' }));
          }
        });
        break;
      }
    }
  }

  return { onMessage, onDisconnect };
}

export default undefined;
