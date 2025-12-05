<template>
  <section class="page tickets">
    <h1 class="page__title mb-4">Мои билеты</h1>

    <div v-if="pending" class="py-6">
      <UiSpinner />
    </div>

    <UiAlert v-else-if="error" type="error" text="Не удалось загрузить билеты" />

    <!-- TODO: нужно привести к figma макету -->
    <div v-else class="tickets__content">
      <p v-if="!hasAny" class="tickets__empty">
        У вас пока нет билетов.
      </p>

      <template v-else>
        <!-- Не оплаченные -->
        <section v-if="unpaid.length" class="tickets__section">
          <h2 class="tickets__section-title">Не оплаченные</h2>
          <div class="tickets__section-line" />

          <ul class="tickets__list">
            <li
              v-for="b in unpaid"
              :key="b.id"
              class="tickets__row"
            >
              <!-- Левая колонка: фильм / кинотеатр / дата-время -->
              <div class="tickets__col tickets__col--main">
                <div class="tickets__movie">
                  {{ b.movieTitle || b.sessionTitle }}
                </div>
                <div v-if="b.cinemaName" class="tickets__cinema">
                  {{ b.cinemaName }}
                </div>
                <div class="tickets__datetime">
                  {{ formatDateLine(b.startsAt) }}
                </div>
              </div>

              <!-- Средняя колонка: места -->
              <div
                v-if="seatLines(b).length"
                class="tickets__col tickets__col--seats"
              >
                <p
                  v-for="(line, idx) in seatLines(b)"
                  :key="idx"
                  class="tickets__seat-line"
                >
                  {{ line }}
                </p>
              </div>

              <!-- Правая колонка: оплата + таймер -->
              <div class="tickets__col tickets__col--actions">
                <UiButton
                  size="sm"
                  variant="outline"
                  class="tickets__pay-btn"
                  @click="pay(b.id)"
                >
                  Оплатить
                </UiButton>

                <div class="tickets__timer-wrap">
                  <span class="tickets__timer-label">Осталось</span>
                  <UiCountdown
                    class="tickets__timer"
                    :deadline="deadline(b)"
                    @end="refresh"
                  />
                </div>
              </div>
            </li>
          </ul>
        </section>

        <!-- Будущие -->
        <section v-if="upcoming.length" class="tickets__section">
          <h2 class="tickets__section-title">Будущие</h2>
          <div class="tickets__section-line" />

          <ul class="tickets__list">
            <li
              v-for="b in upcoming"
              :key="b.id"
              class="tickets__row"
            >
              <div class="tickets__col tickets__col--main">
                <div class="tickets__movie">
                  {{ b.movieTitle || b.sessionTitle }}
                </div>
                <div v-if="b.cinemaName" class="tickets__cinema">
                  {{ b.cinemaName }}
                </div>
                <div class="tickets__datetime">
                  {{ formatDateLine(b.startsAt) }}
                </div>
              </div>

              <div
                v-if="seatLines(b).length"
                class="tickets__col tickets__col--seats"
              >
                <p
                  v-for="(line, idx) in seatLines(b)"
                  :key="idx"
                  class="tickets__seat-line"
                >
                  {{ line }}
                </p>
              </div>

              <div class="tickets__col tickets__col--actions tickets__col--actions-muted">
                <!-- для будущих ничего не показываем, просто выравниваем -->
              </div>
            </li>
          </ul>
        </section>

        <!-- Прошедшие -->
        <section v-if="past.length" class="tickets__section">
          <h2 class="tickets__section-title">Прошедшие</h2>
          <div class="tickets__section-line" />

          <ul class="tickets__list">
            <li
              v-for="b in past"
              :key="b.id"
              class="tickets__row"
            >
              <div class="tickets__col tickets__col--main">
                <div class="tickets__movie">
                  {{ b.movieTitle || b.sessionTitle }}
                </div>
                <div v-if="b.cinemaName" class="tickets__cinema">
                  {{ b.cinemaName }}
                </div>
                <div class="tickets__datetime">
                  {{ formatDateLine(b.startsAt) }}
                </div>
              </div>

              <div
                v-if="seatLines(b).length"
                class="tickets__col tickets__col--seats"
              >
                <p
                  v-for="(line, idx) in seatLines(b)"
                  :key="idx"
                  class="tickets__seat-line"
                >
                  {{ line }}
                </p>
              </div>

              <div class="tickets__col tickets__col--actions tickets__col--actions-muted">
                <!-- прошедшие: без кнопок -->
              </div>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BookingVm } from '@/types/api'

definePageMeta({ middleware: 'auth' })

const store = useBookingsStore()
const settings = useSettingsStore()

const { unpaid, upcoming, past, pending, error } = storeToRefs(store)

onMounted(async () => {
  await Promise.all([settings.fetchSettings(), store.fetchMyBookings()])
})

const hasAny = computed(
  () => unpaid.value.length + upcoming.value.length + past.value.length > 0,
)

function deadline(b: BookingVm) {
  const t = settings.paymentTimeoutSeconds
  return new Date(new Date(b.bookedAt).getTime() + t * 1000)
}

async function pay(id: string) {
  await store.pay(id)
  await store.fetchMyBookings()
}
async function refresh() {
  await store.fetchMyBookings()
}

// Для подписи: «Ряд 1, место 2»
function seatLines(b: BookingVm): string[] {
  const seats = b.seats || []
  if (!seats.length) return []
  return seats.map((s) => `Ряд ${s.row}, место ${s.col}`)
}

function formatDateLine(iso: string) {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${dd}.${mm}  ${hh}:${mi}`
}
</script>

<style scoped lang="postcss">
.tickets__content {
  @apply w-full;
}

/* пустое состояние */
.tickets__empty {
  @apply text-[13px] opacity-70;
}

/* секции */
.tickets__section {
  @apply mt-6;
}
.tickets__section:first-of-type {
  @apply mt-4;
}

.tickets__section-title {
  @apply text-[13px] uppercase tracking-[0.08em] mb-2 opacity-80;
}

.tickets__section-line {
  @apply border-t border-border mb-2;
}

/* список/строки */
.tickets__list {
  @apply w-full;
  list-style: none;
  margin: 0;
  padding: 0;
}

.tickets__row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1.5fr) minmax(0, 1fr);
  @apply items-center gap-x-8 gap-y-2 py-4 border-t border-border;
}

/* колонки */
.tickets__col {
  @apply min-w-0;
}

.tickets__col--main {
  @apply flex flex-col gap-1;
}

.tickets__col--seats {
  @apply text-[14px] leading-snug;
}

.tickets__col--actions {
  @apply flex flex-col items-end gap-2;
}

.tickets__col--actions-muted {
  @apply opacity-70;
}

/* текстовые стили */
.tickets__movie {
  @apply text-[16px] leading-none;
}

.tickets__cinema {
  @apply text-[14px] opacity-80;
}

.tickets__datetime {
  @apply text-[14px] mt-1;
}

.tickets__seat-line {
  @apply text-[14px];
}

/* кнопка оплаты / таймер */
.tickets__pay-btn {
  @apply min-w-[96px];
}

.tickets__timer-wrap {
  @apply flex items-baseline gap-1 text-[13px];
}

.tickets__timer-label {
  @apply opacity-80;
}

.tickets__timer {
  @apply font-mono;
}

/* простая адаптация под узкий экран */
@media (max-width: 768px) {
  .tickets__row {
    grid-template-columns: minmax(0, 1fr);
    @apply gap-y-3;
  }

  .tickets__col--actions {
    @apply items-start;
  }
}
</style>
