<template>
  <section class="movies">
    <h1 class="card__title mb-4">Фильмы</h1>

    <div v-if="pending" class="py-6"><UiSpinner /></div>
    <UiAlert v-else-if="error" type="error" text="Не удалось загрузить фильмы" />

    <div v-else class="grid grid-cols-4 gap-4">
      <article v-for="m in movies" :key="m.id" class="card card--interactive">
        <img :src="m.posterUrl" :alt="m.title" class="w-full h-64 object-cover rounded-lg mb-3" />
        <h3 class="card__title mb-2">{{ m.title }}</h3>
        <UiButton :to="`/movies/${m.id}`" label="Просмотреть сеансы" />
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
const catalog = useCatalogStore()
const { movies, pending, error } = storeToRefs(catalog)

onMounted(() => {
  catalog.fetchMovies()
})
</script>
