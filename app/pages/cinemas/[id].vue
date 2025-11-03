<template>
  <section>
    <h1 class="card__title mb-4">{{ cinemaTitle }}</h1>

    <div v-if="pending" class="py-6"><UiSpinner /></div>
    <UiAlert v-else-if="error" type="error" text="Не удалось загрузить сеансы" />

    <div v-else>
      <UiTable>
        <thead>
          <tr>
            <th>Кинотеатр</th>
            <th>Начало</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in sessions" :key="s.id">
            <td>{{ s.cinemaName }}</td>
            <td>{{ formatDateTime(s.startsAt) }}</td>
            <td class="text-right">
              <UiButton :to="`/sessions/${s.id}`" label="Выбрать места" />
            </td>
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

// заголовок возьмём из первой сессии (или из списка кинотеатров по id)
const cinemaTitle = computed(() => sessions.value?.[0]?.cinemaName || 'Кинотеатр')

onMounted(() => {
  catalog.fetchCinemaWithSessions(route.params.id as string)
})
</script>
