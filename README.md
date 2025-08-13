# StarCheckers — Telegram Mini App

## Темы
Доступны три темы: **Classic**, **Walnut** и **Graphite**. Выбранная тема сохраняется в `localStorage` и применяется при следующем запуске.

## Звук
Используется WebAudio API. Звуки ходов могут быть включены или отключены в настройках.

## Деплой
Статические файлы подключаются с параметром версии `?v=<timestamp>` для предотвращения кэширования. При деплое обновляйте параметр в ссылках и выполняйте принудительный "Deploy latest commit".

## Authentication

WebSocket clients may optionally send an `auth` message containing Telegram `initData`.
Verified users receive their Telegram profile; otherwise the server assigns an
anonymous identity. Matchmaking works for both verified and anonymous players.
