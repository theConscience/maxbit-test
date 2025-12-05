<template>
  <div class="app">
    <div class="app__stage">
      <!-- Хедер -->
      <header class="app-header">
        <div class="app-header__inner">
          <h1 class="app-header__title">
            {{ pageTitle }}
          </h1>

          <div class="app-header__controls">
            <button
              class="app-header__theme"
              :title="isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'"
              @click="toggle"
            >
              <Icon
                v-if="isDark"
                name="i-heroicons-moon-20-solid"
                aria-hidden="true"
                class="app-header__theme-icon"
              />
              <Icon
                v-else
                name="i-heroicons-sun-20-solid"
                aria-hidden="true"
                class="app-header__theme-icon"
              />
              <!-- Текст на случай, если иконка не загрузилась + для скринридеров -->
              <span class="sr-only">{{ isDark ? 'Тёмная тема' : 'Светлая тема' }}</span>
            </button>

            <select
              class="app-header__select"
              :value="mode"
              @change="setMode(($event.target as HTMLSelectElement).value as any)"
            >
              <option value="system">Системная</option>
              <option value="light">Светлая</option>
              <option value="dark">Тёмная</option>
            </select>
          </div>
        </div>
      </header>

      <!-- Рамка -->
      <div class="app-frame">
        <div class="app-layout">
          <!-- НАВИГАЦИЯ -->
          <aside class="app-nav" aria-label="Навигация">
            <nav class="app-nav__list">
              <NuxtLink
                to="/movies"
                class="app-nav__link"
                :class="{ 'app-nav__link--active': isMoviesRoute }"
              >
                Фильмы
              </NuxtLink>

              <NuxtLink
                to="/cinemas"
                class="app-nav__link"
                :class="{ 'app-nav__link--active': isCinemasRoute }"
              >
                Кинотеатры
              </NuxtLink>

              <NuxtLink
                v-if="isAuthed"
                to="/tickets"
                class="app-nav__link"
                :class="{ 'app-nav__link--active': isTicketsRoute }"
              >
                Мои билеты
              </NuxtLink>

              <button
                v-if="isAuthed"
                type="button"
                class="app-nav__link app-nav__link--button"
                @click="logout"
              >
                Выход
              </button>
              <NuxtLink
                v-else
                to="/auth/login"
                class="app-nav__link"
                :class="{ 'app-nav__link--active': isAuthRoute }"
              >
                Вход
              </NuxtLink>
            </nav>

            <Transition name="app-nav-hint">
              <div v-if="ui.navHint" :key="ui.navHint" v-html="ui.navHint" class="app-nav__hint"></div>
            </Transition>
          </aside>

          <!-- КОНТЕНТ -->
          <main class="app-main">
            <slot />
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const ui = useUiStatusStore()
const auth = useAuthStore()
const isAuthed = computed(() => !!auth.token)
const { isDark, mode, setMode, toggle } = useTheme()


function logout() {
  const sure = confirm('Вы уверены что хотите выйти?')
  if (!sure) return

  auth.logout()
  navigateTo('/movies')
}

// Подсветка активных
const routeName = computed(() => String(route.name ?? ''))

const isMoviesRoute = computed(() => routeName.value.startsWith('movies'))
const isCinemasRoute = computed(() => routeName.value.startsWith('cinemas'))
const isTicketsRoute = computed(() => routeName.value.startsWith('tickets'))
const isAuthRoute = computed(() => routeName.value.startsWith('auth'))

// Заголовок
const pageTitle = computed(() => {
  if (isMoviesRoute.value) return 'Фильмы'
  if (isCinemasRoute.value) return 'Кинотеатры'
  if (isTicketsRoute.value) return 'Мои билеты'
  if (isAuthRoute.value) return 'Вход / Регистрация'
  return 'Фильмы'
})
</script>

<style scoped lang="postcss">
.app {
  @apply min-h-screen bg-bg text-fg px-2;
}

.app__stage {
  @apply w-full;
}

/* HEADER */
.app-header {
  @apply mx-auto w-full max-w-[944px] pt-6 lg:pt-[34px] mb-3;
}

.app-header__inner {
  @apply flex items-center justify-between gap-4;
}

.app-header__title {
  @apply text-[28px] leading-[1.1] font-normal;
  text-decoration-color: var(--fg);
}

.app-header__controls {
  @apply flex items-center gap-3 text-xs;
}

/* .app-header__theme { */
/*   @apply underline-offset-2 hover:underline; */
/* } */

/* Иконка-кнопка: квадратная, с фокус-обводкой */
.app-header__theme {
  @apply inline-flex items-center justify-center h-8 w-8 rounded-full
         border border-border bg-transparent;
}
.app-header__theme:hover {
  background-color: var(--overlay);
}
.app-header__theme:focus-visible {
  @apply outline-none ring-2;
  --tw-ring-color: var(--accent);
}

/* Размеры самой SVG-иконки */
.app-header__theme-icon {
  @apply w-4 h-4;
}

.app-header__select {
  @apply hidden bg-transparent border border-border px-2 py-1 text-xs;
}

/* FRAME */
.app-frame {
  @apply mx-auto w-full max-w-[944px] min-h-[624px] border-2 border-strong;
}

/* LAYOUT */
.app-layout {
  @apply grid grid-cols-1 lg:grid-cols-[176px_1fr] lg:gap-x-16 lg:pr-20;
}

/* NAV */
.app-nav {
  @apply flex w-full border-b border-strong relative
    lg:block lg:w-[176px] lg:h-[504px] lg:border lg:border-border lg:border-b-0 lg:bg-transparent lg:pt-8;

  border: 1px solid var(--border);
}

.app-nav__list {
  @apply flex w-full lg:block;
}

.app-nav__link {
  @apply flex-1 text-center px-2 py-2 text-[11px]
    border-r border-muted last:border-r-0
    transition-colors
    lg:block lg:w-full lg:px-8 lg:py-3 lg:text-left lg:text-[14px]
    lg:border lg:border-transparent;
  text-decoration-color: var(--fg);
}

/* hover-эффект через var(--overlay), а не несуществующий hover:bg-overlay */
.app-nav__link:hover {
  background-color: var(--overlay);
}

/* .app-nav__link--button {*/
/*   @apply text-left;     */
/* }                       */

.app-nav__link--active {
  @apply lg:border-strong;
  background-color: var(--overlay);
}

/* хинт снизу меню */
.app-nav__hint {
  @apply mt-auto absolute w-full bottom-0 px-4 py-3 text-[12px] max-h-[256px] overflow-auto leading-snug opacity-80;
}

/* MAIN */
.app-main {
  @apply pt-6 px-4 lg:px-0 min-w-0;
}

/* sr-only, если глобально нет */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.app-nav-hint-enter-active,
.app-nav-hint-leave-active {
  transition: opacity 0.18s ease-in-out;
  /* transition: opacity 0.18s ease-in-out, transform 0.18s ease; */
}

.app-nav-hint-enter-from,
.app-nav-hint-leave-to {
  opacity: 0;
  /* transform: translateY(4px); */
}

.app-nav-hint-enter-to,
.app-nav-hint-leave-from {
  opacity: 1;
  /* transform: translateX(0); */
}
</style>
