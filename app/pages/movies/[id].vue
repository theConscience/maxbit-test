<template>
  <section class="page movie">
    <h1 class="page__title mb-4">
      {{ movie?.title || 'Фильм' }}
    </h1>

    <!-- загрузка / ошибка -->
    <div v-if="pending" class="py-6">
      <UiSpinner />
    </div>

    <UiAlert v-else-if="error" type="error" text="Не удалось загрузить сеансы" />

    <!-- контент -->
    <div v-else-if="movie" class="movie-layout">
      <!-- верхний блок: постер + описание + метрики -->
      <header class="movie-header">
        <figure class="movie-poster" aria-hidden="true">
          <img
            v-if="movie.posterUrl"
            :src="movie.posterUrl"
            :alt="`Постер: ${movie.title}`"
            :title="`Постер: ${movie.title}`"
            class="movie-poster__img"
            loading="lazy"
            decoding="async"
          />
          <Icon v-else name="app:i-movie-poster" class="movie-poster__icon" />
        </figure>

        <div class="movie-header__text">
          <!-- описание -->
          <p v-if="movie.description" class="movie-desc">
            {{ movie.description }}
          </p>

          <!-- мета-инфа -->
          <div class="movie-meta" aria-label="Информация о фильме">
            <span v-if="movie.year">Год: {{ movie.year }}</span>
            <span v-if="movie.durationMin"> Продолжительность: {{ toHm(movie.durationMin) }} </span>
            <span v-if="movie.rating !== undefined"> Рейтинг: {{ movie.rating.toFixed(1) }} </span>
          </div>
        </div>
      </header>

      <ShowtimesList
        v-if="groupedByDate.length"
        :sessions="sessions"
        group-by="cinema"
        empty-text="Нет доступных сеансов для этого фильма."
        max-height-class="max-h-[360px]"
        caption="Доступные сеансы"
      />

      <p v-else class="movie-empty">Нет доступных сеансов для этого фильма.</p>
    </div>

    <!-- если вдруг movie не пришёл, но и ошибок нет -->
    <p v-else class="movie-empty">Данные о фильме не найдены.</p>
  </section>
</template>


<script setup lang="ts">
import type { Session } from '@/types/api'
import ShowtimesList from '@/components/domain/ShowtimesList.vue'

const route = useRoute()
const catalog = useCatalogStore()

const movie = computed(() => catalog.movie)
const sessions = computed(() => catalog.movieSessions)
const pending = computed(() => catalog.pending)
const error = computed(() => catalog.error)

onMounted(() => {
  catalog.fetchMovieWithSessions(route.params.id as string)
})

function toHm(min?: number) {
  if (!min || min <= 0) return '—'
  const h = Math.floor(min / 60)
  const m = String(min % 60).padStart(2, '0')
  return `${h}:${m}`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

function toDateLabel(iso: string) {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}`
}

const groupedByDate = computed(() => {
  type SessionVM = Session
  type CinemaBlock = { name: string; sessions: SessionVM[] }
  type DateBlock = { date: string; cinemas: CinemaBlock[] }

  const map = new Map<string, DateBlock>()

  for (const s of sessions.value) {
    const date = toDateLabel(s.startsAt)
    const cinemaName = s.cinemaName || `Кинотеатр #${s.cinemaId}`

    let block = map.get(date)
    if (!block) {
      block = { date, cinemas: [] }
      map.set(date, block)
    }

    let cinema = block.cinemas.find((c) => c.name === cinemaName)
    if (!cinema) {
      cinema = { name: cinemaName, sessions: [] }
      block.cinemas.push(cinema)
    }

    cinema.sessions.push(s)
  }

  const res = Array.from(map.values()).sort((a, b) => {
    const [ad = 0, am = 0] = a.date.split('.').map(Number)
    const [bd = 0, bm = 0] = b.date.split('.').map(Number)
    return am === bm ? ad - bd : am - bm
  })

  res.forEach((block) => {
    block.cinemas.sort((a, b) => a.name.localeCompare(b.name))
    block.cinemas.forEach((c) => {
      c.sessions.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    })
  })

  return res
})
</script>

<style scoped lang="postcss">
/* общий лэйаут страницы фильма */
.movie-layout {
  @apply flex flex-col gap-6 w-full;
}

/* верхний блок */
.movie-header {
  @apply flex gap-6 items-start w-full font-sans-token;

  font-weight: 400;
  font-style: Regular;
  font-size: 13px;
  leading-trim: NONE;
  line-height: 100%;
  letter-spacing: 0%;
}

.movie-header__text {
  @apply flex flex-col gap-3 max-w-full;
}

/* постер по ТЗ */
.movie-poster {
  @apply flex items-center justify-center rounded-lg border-strong shrink-0;
  /* @apply flex items-center justify-center w-[136px] h-[136px] rounded-lg border border-strong shrink-0; */
}
.movie-poster__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: .5rem; /* под rounded-lg */
}
.movie-poster__icon {
  @apply w-[98px] h-[100px] opacity-100;

  color: var(--fg);
  --stroke: 3;
}

/* описание */
.movie-desc {
  @apply font-sans-token text-[13px] leading-tight text-fg max-w-[420px] md:max-w-[520px];
}

/* мета-инфа */
.movie-meta {
  @apply flex flex-wrap flex-col text-[13px] leading-tight text-fg;
}

/* контейнер для списка с внутренним скроллом */
.movie-sessions-wrap {
  @apply mt-1 w-full;
}

/* скролл только внутри списка сеансов */
.movie-sessions {
  @apply max-h-[360px] pr-2 overflow-y-auto;
}

/* семантические списки */
.movie-date-list,
.movie-cinema-list,
.movie-time-list {
  @apply list-none m-0 p-0;
}

/* расстояние между блоками дат */
.movie-date-item + .movie-date-item {
  @apply mt-4;
}

/* дата */
.movie-date-separator {
  @apply mt-6 pb-2 border-b border-strong text-[14px] leading-none;
}

/* строка кинотеатра:
 * мобилка — колонка,
 * c 425px — в ряд, название слева, время справа
 */
.movie-cinema-row {
  @apply flex flex-col gap-2 border-t border-border pt-3 pb-3;
}
@media (min-width: 425px) {
  .movie-cinema-row {
    @apply flex-row items-center justify-between gap-4;
  }
}

/* название кинотеатра */
.movie-cinema-name {
  @apply text-[16px] leading-tight font-sans-token break-words;
}

/* список времён:
 * мобилка — слева, wrap,
 * с 425px — справа
 */
.movie-time-list {
  @apply flex flex-wrap gap-2 justify-start w-full;
}
@media (min-width: 425px) {
  .movie-time-list {
    @apply justify-end;
  }
}

/* кнопка времени */
.movie-time-btn {
  @apply min-w-[72px] h-8 px-4 text-[12px];
}

/* пустое состояние */
.movie-empty {
  @apply text-[13px] opacity-70;
}

/* sr-only (если нет глобального) */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* скроллбар как в остальных местах */
.movie-sessions::-webkit-scrollbar {
  width: 6px;
}
.movie-sessions::-webkit-scrollbar-track {
  background: transparent;
}
.movie-sessions::-webkit-scrollbar-thumb {
  background-color: var(--muted);
  border-radius: 999px;
}
.movie-sessions::-webkit-scrollbar-thumb:hover {
  background-color: var(--border);
}
.movie-sessions {
  scrollbar-width: thin;
  scrollbar-color: var(--muted) transparent;
}
</style>
