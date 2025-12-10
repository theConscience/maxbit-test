# Cinema App Test (Nuxt 4)

Небольшое SPA/SSR-приложение для покупки кино-билетов.

Стек:
- Nuxt 4 (Vue 3, TypeScript, srcDir = `app/`)
- Pinia (stores)
- Tailwind CSS + PostCSS nesting + CSS-токены (`assets/css/tokens.css`)
- BEM-классы + `@apply` поверх tailwind-утилит
- Локальный mock-API через `server/api/[...path].ts` + `_db.ts`

## Требования

- Node 20+ (лучше тот же, что в `nuxt.config`/lock-файле)
- pnpm (предполагается, что используется pnpm)

## Установка и запуск

```bash
# зависимости
pnpm install

# дев-сервер
pnpm dev

# production-сборка SSR
pnpm build
pnpm start

# SPA-сборка (если нужна)
pnpm build:spa
pnpm preview:spa
````

Точные скрипты смотри в `package.json`, но логика такая:
`dev`, `build`, `start`, `generate`, `build:spa`, `preview:spa`, `lint`, `lint:eslint`, `lint:style`, `typecheck`.

## Настройки API

HTTP-клиент (`app/composables/useApi.ts`) всегда ходит на `/api`.
Дальше работает так:

* Если **задана** `runtimeConfig.public.API_BASE_URL` (из `.env` или `nuxt.config`):

  * `server/api/[...path].ts` **проксирует** запрос на реальный бекенд `API_BASE_URL`.
  * Авторизация — через `Authorization: Bearer <token>` (берётся из Pinia-стора `auth`).

* Если `API_BASE_URL` **не задан**:

  * Используется внутренний мок на основе `server/_db.ts`:

    * фильмы, кинотеатры, сессии, бронирования/оплата, настройки (таймаут оплаты).
    * Эндпойнты максимально похожи на боевой API.

То есть:

* **Для локальной разработки с мок-данными (_db.ts)** — дополнительных действий
  не требуется, просто `pnpm dev`.
* **Для работы с реальным API** — добавляете в `.env` что-то вроде:

  ```bash
  API_BASE_URL=https://api.example.com
  ```

## Архитектура

* `app/layouts/default.vue` — общий каркас: хедер, переключатель темы, левая навигация, рамка, хинт снизу меню.
* `app/pages/*`:

  * `/movies` — список фильмов.
  * `/cinemas` и `/cinemas/[id]` — список кинотеатров и сеансы по кинотеатру.
  * `/sessions/[id]` — выбор мест (SeatMap) + бронирование.
  * `/tickets` — «Мои билеты» (требует авторизации, см. `app/middleware/auth.ts`).
  * `/auth/login`, `/auth/register` — простая авторизация.
* `app/stores`:

  * `catalog` — фильмы/кинотеатры/сессии.
  * `auth` — токен, логин/логаут.
  * `bookings` — бронирования, оплата, бронирование мест.
  * `settings` — глобальные настройки (таймаут оплаты).
  * `theme`, `uiStatus` — тема и навигационный хинт.
* `app/components/domain`:

  * `ShowtimesList.vue` — универсальный список сеансов (группировка по фильму/кинотеатру).
  * `SeatMap.vue` — схема зала с «липкими» номерами рядов/мест и hover-хинтом через стор.
* `app/components/ui`:

  * `UiButton`, `UiInput`, `UiTable`, `UiCountdown`, `UiAlert`, `UiSpinner` и т.д. — базовые контролы.
* `assets/css/tokens.css` — цветовые и типографические токены (светлая/тёмная тема).

Подход к стилям:

* BEM-классы (`.page`, `.page__title`, `.tickets__row` и т.п.).
* В стилях — `lang="postcss"`, вложенность (`&`) и `@apply` для tailwind-утилит.
* Где нужно точное соответствие макету (кнопка, инпут, карта мест) — аккуратный hand-written CSS на токенах.

