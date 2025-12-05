<template>
  <section class="page">
    <h1 class="page__title mb-4">UI тест</h1>

    <div class="flex flex-col gap-4 max-w-[480px]">
      <div class="flex items-center gap-3">
        <UiSpinner size="sm" />
        <UiSpinner />
        <UiSpinner size="lg" />
      </div>

      <UiAlert type="info" text="Информационное сообщение" />
      <UiAlert type="success" text="Успешно всё отработало" />
      <UiAlert type="warning" text="Что-то пошло не так, но не критично" />
      <UiAlert type="error">
        Ошибка загрузки данных. Попробуй обновить страницу.
      </UiAlert>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>
