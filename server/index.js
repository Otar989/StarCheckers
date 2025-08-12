import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { createMatchmaker } from './matchmaker.js';
import { verifyInitData } from './telegram.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 8080;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

// Health
app.get('/health', (_,res)=>res.json({ok:true, time:Date.now()}));

// Раздаём статику из ../public
const publicDir = path.join(__dirname, '../public');
app.use((req,res,next)=>{ res.set('Cache-Control','no-store'); next(); });
app.use(express.static(publicDir, { etag:false, lastModified:false }));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const server = createServer(app);

// WebSocket
const wss = new WebSocketServer({ server, path: '/ws' });
const mm = createMatchmaker({ verifyInitData });

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', ()=> ws.isAlive = true);

  ws.on('message', async raw => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    if (msg.type === 'auth') {
      const { initData } = msg;
      const ok = await verifyInitData(initData);
      ws.user = ok?.user ?? { id: 'anon_'+Math.random().toString(36).slice(2), name: 'Anon' };
      ws.send(JSON.stringify({ type: 'auth_ok', user: ws.user }));
      return;
    }

    mm.onMessage(ws, msg);
  });

  ws.on('close', () => mm.onDisconnect(ws));
});

// ping/pong
setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false; ws.ping();
  });
}, 15000);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Public: ${PUBLIC_URL}`);
});
