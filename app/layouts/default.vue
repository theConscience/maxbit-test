<template>
  <div class="min-h-screen bg-bg text-fg">
    <header class="header">
      <h1 class="header__title">Фильмы / Главная</h1>
    </header>

    <div class="frame">
      <div class="layout">
        <!-- Левое меню -->
        <aside class="sidebar" aria-label="Навигация">
          <nav class="sidebar__nav">
            <NuxtLink
              to="/movies"
              class="sidebar__link"
              :class="{ 'sidebar__link--active': route.name === 'movies' }"
            >Фильмы</NuxtLink>
            <NuxtLink
              to="/cinemas"
              class="sidebar__link"
              :class="{
                'sidebar__link--active': route.name === 'cinemas',
              }"
            >Кинотеатры</NuxtLink>
            <NuxtLink
              v-if="isAuthed"
              to="/tickets"
              class="sidebar__link"
              :class="{
                'sidebar__link--active': route.name === 'tickets',
              }"
            >Мои билеты</NuxtLink>
            <template v-if="isAuthed">
              <button class="sidebar__link" @click="logout">Выход</button>
            </template>
            <template v-else>
              <NuxtLink
                to="/auth/login"
                class="sidebar__link"
                :class="{ 'sidebar__link--active': route.name === 'auth-login' }"
              >Вход</NuxtLink>
            </template>
          </nav>
        </aside>

        <div class="flex items-center gap-3">
          <button class="header__link" @click="toggle">
            {{ isDark ? 'Тёмная' : 'Светлая' }}
          </button>
          <select
            class="header__link"
            :value="mode"
            @change="setMode(($event.target as HTMLSelectElement).value as any)"
          >
            <option value="system">Системная</option>
            <option value="light">Светлая</option>
            <option value="dark">Тёмная</option>
          </select>
          <!-- <template v-if="isAuthed"> -->
          <!--   <button class="header__link" @click="logout">Выход</button> -->
          <!-- </template> -->
          <!-- <template v-else> -->
          <!--   <NuxtLink to="/auth/login" class="header__link">Вход</NuxtLink> -->
          <!-- </template> -->
        </div>

        <!-- Контент -->
        <!-- <main class="container mx-auto py-6"><slot /></main> -->
        <main class="px-4 lg:px-0">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
console.log(route)
const auth = useAuthStore()
const isAuthed = computed(() => !!auth.token)
const { isDark, mode, setMode, toggle } = useTheme()
function logout() {
  auth.logout()
  navigateTo('/movies')
}
</script>

<style scoped lang="postcss">
.header__link {
  @apply text-sm font-medium hover:underline;
}
</style>
