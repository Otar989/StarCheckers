# StarCheckers

Новая версия игры «Русские шашки» на React + TypeScript.

## Development
```bash
npm install
npm run dev
```

## Tests
```bash
npm test
```

## Mock WebSocket server
```bash
npm run mock:ws
```
Сервер поднимается на `ws://localhost:8080` и просто эхо-отправляет сообщения.

## Build PWA
```bash
npm run build
npm run preview
```

## Deploy on Render

Build Command: `npm ci && npm run build`

Publish Directory: `dist`

Environment: Static Site

Environment Variables:

- `NODE_VERSION=18`

SPA fallback via `static.json`

## Telegram Mini App
Подключаемые скрипты (в этом порядке):
1. `tg-viewport.ts`
2. `tg-header-buffer.ts`
3. `layout-engine.ts`
4. `gestures-guard.ts`

Эти модули уже импортированы в `src/main.tsx`.
