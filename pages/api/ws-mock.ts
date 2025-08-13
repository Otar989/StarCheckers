import { WebSocketServer } from 'ws';

const server = new WebSocketServer({ port: 8080 });

server.on('connection', (socket) => {
  socket.on('message', (data) => {
    socket.send(data.toString());
  });
});

console.log('Mock WS server listening on ws://localhost:8080');
