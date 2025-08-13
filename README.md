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

## Telegram Mini App — жесты
- В `styles.css` глобально отключаются прокрутка и pull-to-refresh: `overflow: hidden`, `overscroll-behavior: none`, фиксированный контейнер `#app`.
- Игровая область помечена как `touch-action: none`, чтобы браузер не перехватывал pan/zoom.
- Обработчики `pointer`/`touch` событий добавлены с опцией `{ passive:false }` и вызывают `preventDefault()` в `gestures-guard.js`.
- При старте мини-апа выполняется `Telegram.WebApp.expand()` и задаётся фон через `setBackgroundColor`.

## Адаптация в Telegram WebApp
- Используются метатег `viewport-fit=cover` и CSS-переменные `env(safe-area-inset-*)` для учёта вырезов экрана.
- Переменная `--vh` рассчитывается на основе `Telegram.WebApp.viewportStableHeight` и обновляется при изменении размеров.
- `ResizeObserver` обеспечивает точный квадрат доски без обрезаний и прокрутки.
- Разметка построена сеткой `header / main / footer`, что упрощает адаптивное размещение элементов.
