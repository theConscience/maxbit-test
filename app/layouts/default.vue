<template>
  <div>
    <header class="container mx-auto py-4 flex items-center justify-between">
      <nav class="flex gap-4">
        <NuxtLink to="/movies">Фильмы</NuxtLink>
        <NuxtLink to="/cinemas">Кинотеатры</NuxtLink>
        <NuxtLink to="/tickets">Мои билеты</NuxtLink>
      </nav>
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
        <template v-if="isAuthed">
          <button class="header__link" @click="logout">Выход</button>
        </template>
        <template v-else>
          <NuxtLink to="/auth/login" class="header__link">Вход</NuxtLink>
        </template>
      </div>
    </header>
    <main class="container mx-auto py-6"><slot /></main>
  </div>
</template>

<script setup lang="ts">
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
