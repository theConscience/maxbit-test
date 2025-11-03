<template>
  <section>
    <h1 class="card__title mb-4">{{ cinema?.title || 'Кинотеатр' }}</h1>

    <div v-if="pending" class="py-6"><UiSpinner /></div>
    <UiAlert v-else-if="error" type="error" text="Не удалось загрузить сеансы" />

    <div v-else>
      <UiTable>
        <thead><tr><th>Кинотеатр</th><th>Начало</th><th></th></tr></thead>
        <tbody>
          <tr v-for="s in sessions" :key="s.id">
            <td>{{ s.cinemaName }}</td>
            <td>{{ formatDateTime(s.startsAt) }}</td>
            <td><UiButton :to="`/sessions/${s.id}`" label="Выбрать места" /></td>
          </tr>
        </tbody>
      </UiTable>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatDateTime } from '@/utils/dates'
const route = useRoute()
const catalog = useCatalogStore()

const cinema = computed(() => catalog.cinema)
const sessions = computed(() => catalog.cinemaSessions)
const pending = computed(() => catalog.pending)
const error = computed(() => catalog.error)

onMounted(() => catalog.fetchMovieWithSessions(route.params.id as string))
</script>
