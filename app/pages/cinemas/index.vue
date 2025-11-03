<template>
  <section class="movies">
    <h1 class="card__title mb-4">Кинотеатры</h1>

    <div v-if="pending" class="py-6"><UiSpinner /></div>
    <UiAlert v-else-if="error" type="error" text="Не удалось загрузить кинотеатры" />

    <div v-else class="grid grid-cols-4 gap-4">
      <article v-for="c in cinemas" :key="c.id" class="card card--interactive">
        <img
          v-if="c.posterUrl || c.imageUrl"
          :src="(c.posterUrl || c.imageUrl)!"
          :alt="c.title"
          class="w-full h-64 object-cover rounded-lg mb-3"
        />
        <h3 class="card__title mb-2">{{ c.title }}</h3>
        <UiButton :to="`/cinemas/${c.id}`" label="Просмотреть сеансы" />
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
const catalog = useCatalogStore()
const { cinemas, pending, error } = storeToRefs(catalog)
onMounted(() => {
  catalog.fetchCinemas()
})
</script>
