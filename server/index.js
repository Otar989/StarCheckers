import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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
const commit = process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || 'dev';
const indexHtml = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8').replace(/__VERSION__/g, commit);
app.use((req,res,next)=>{ res.set('Cache-Control','no-store'); next(); });
app.use(express.static(publicDir, { etag:false, lastModified:false }));

app.get('/', (req, res) => {
  res.type('html').send(indexHtml);
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
