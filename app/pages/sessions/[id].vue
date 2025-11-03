<template>
  <section>
    <h1 class="card__title mb-4">Выбор мест</h1>

    <div v-if="pending" class="py-6"><UiSpinner /></div>
    <UiAlert v-else-if="error" type="error" text="Не удалось загрузить сеанс" />

    <div v-else-if="session">
      <p class="mb-4 opacity-80">
        Кинотеатр: {{ session.cinemaName || '—' }} · Начало: {{ formatDateTime(session.startsAt) }}
      </p>

      <SeatMap
        :rows="session.rows || 8"
        :cols="session.cols || 12"
        :booked="session.bookedSeats || []"
        v-model="selected"
        class="mb-4"
      />

      <UiButton :disabled="selected.length === 0" variant="outline" @click="book">
        Забронировать
      </UiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatDateTime } from '@/utils/dates'
import SeatMap from '@/components/domain/SeatMap.vue'

const route = useRoute()
const catalog = useCatalogStore()
const bookings = useBookingsStore?.() // если стора ещё нет — можно временно убрать

const session = computed(() => catalog.session)
const pending = computed(() => catalog.pending)
const error = computed(() => catalog.error)

/** SeatMap эмитит ['1-2','1-3', ...] */
const selected = ref<string[]>([])

onMounted(() => {
  catalog.fetchSession(route.params.id as string)
})

/** строгая типизация + защита от NaN/undefined */
function toPairs(ids: string[]): Array<{ row: number; col: number }> {
  return ids
    .map((id) => {
      const [rs = '', cs = ''] = id.split('-')
      const row = Number(rs)
      const col = Number(cs)
      return Number.isFinite(row) && Number.isFinite(col) ? { row, col } : null
    })
    .filter((x): x is { row: number; col: number } => x !== null)
}

async function book() {
  if (!session.value) return
  // если store бронирований ещё не подключён — закомментируй следующую строку
  await bookings?.bookSeats?.(session.value.id, toPairs(selected.value))
  navigateTo('/tickets')
}
</script>
