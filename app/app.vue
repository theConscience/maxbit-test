<template>
  <!-- Ссылка для быстрой навигации клавиатурой -->
  <a href="#app-main" class="sr-only focus:not-sr-only focus:fixed focus:z-[9999] focus:top-2 focus:left-2 btn">
    Перейти к содержимому
  </a>

  <!-- Индикатор загрузки Nuxt (верхняя полоска) -->
  <NuxtLoadingIndicator color="#82609b" />

  <!-- Глобальный лейаут -->
  <NuxtLayout>
    <NuxtPage id="app-main" />
  </NuxtLayout>

  <!-- Озвучивание смены маршрутов (A11y) -->
  <NuxtRouteAnnouncer />
</template>

<script setup lang="ts">
// Инициализация темы как можно раньше (добавит/уберёт .dark на <html>)
// const { } = useTheme()

// Базовые атрибуты <body> (шрифт уже подключён через @nuxt/fonts)
useHead({
  bodyAttrs: {
    class: 'font-sans antialiased',
  },
})
</script>

<style>
/* Глобальные переходы страниц */
.page-enter-active,
.page-leave-active {
  transition: opacity 180ms ease, transform 220ms ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
