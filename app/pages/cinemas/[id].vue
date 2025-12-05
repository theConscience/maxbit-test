<template>
  <section class="page cinema">
    <h1 class="page__title mb-4">
      {{ cinemaTitle }}
    </h1>

    <!-- загрузка / ошибка -->
    <div v-if="pending" class="py-6">
      <UiSpinner />
    </div>
    <UiAlert v-else-if="error" type="error" text="Не удалось загрузить сеансы" />

    <!-- контент -->
    <div v-else-if="cinema" class="cinema-layout">
      <ShowtimesList
        v-if="sessions.length"
        :sessions="sessions"
        group-by="movie"
        max-height-class="max-h-[530px] lg:max-h-[440px]"
        caption="Сеансы в этом кинотеатре"
      />
      <p v-else class="cinema-empty">Нет доступных сеансов для этого кинотеатра.</p>
    </div>

    <!-- если вдруг cinema не пришёл, но и ошибок нет -->
    <p v-else class="cinema-empty">Данные о кинотеатре не найдены.</p>
  </section>
</template>


<script setup lang="ts">
import type { Session } from '@/types/api'
import ShowtimesList from '@/components/domain/ShowtimesList.vue'

const route = useRoute()
const catalog = useCatalogStore()

const sessions = computed(() => catalog.cinemaSessions)
const pending = computed(() => catalog.pending)
const error = computed(() => catalog.error)
const cinema = computed(() => catalog.cinema)

onMounted(() => {
  catalog.fetchCinemaWithSessions(route.params.id as string)
})

const cinemaTitle = computed(
  () => cinema.value?.title || sessions.value?.[0]?.cinemaName || 'Кинотеатр',
)

function formatTime(iso: string) {
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}
function toDateLabel(iso: string) {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}`
}

/** Группировка: дата → фильм → сеансы */
const groupedByDate = computed(() => {
  type S = Session
  type FilmBlock = { title: string; sessions: S[] }
  type DateBlock = { date: string; films: FilmBlock[] }

  const map = new Map<string, DateBlock>()

  for (const s of sessions.value) {
    const date = toDateLabel(s.startsAt)
    const title = s.movieTitle || `Фильм #${s.movieId}`

    let db = map.get(date)
    if (!db) {
      db = { date, films: [] }
      map.set(date, db)
    }

    let fb = db.films.find((f) => f.title === title)
    if (!fb) {
      fb = { title, sessions: [] }
      db.films.push(fb)
    }
    fb.sessions.push(s)
  }

  // сортировки: по дате, по названию фильма, по времени
  const res = Array.from(map.values()).sort((a, b) => {
    const [ad = 0, am = 0] = a.date.split('.').map(Number)
    const [bd = 0, bm = 0] = b.date.split('.').map(Number)
    return am === bm ? ad - bd : am - bm
  })
  res.forEach((db) => {
    db.films.sort((a, b) => a.title.localeCompare(b.title))
    db.films.forEach((f) =>
      f.sessions.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    )
  })
  return res
})
</script>

<style scoped lang="postcss">
/* лэйаут */
.cinema-layout {
  @apply flex flex-col gap-6 w-full;
}
.cinema-sessions-wrap {
  @apply mt-1 w-full;
}
.cinema-sessions {
  @apply max-h-[360px] pr-2 overflow-y-auto;
}

/* списки */
.date-list,
.movie-list,
.time-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.date-item + .date-item {
  margin-top: 16px;
}

/* дата */
.date-sep {
  margin-top: 24px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-strong);
  font-size: 14px;
  line-height: 1;
}

/* строка фильма */
.movie-row {
  @apply flex items-center justify-between gap-4 border-t border-border py-4;
}

/* фильм: мини-иконка + название */
.movie-meta {
  @apply flex items-center gap-3;
}
.thumb {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.thumb__icon {
  width: 18px;
  height: 18px;
  opacity: 0.6;
}
.movie-title {
  font-size: 16px;
  line-height: 1;
}

/* времена */
.time-list {
  @apply flex flex-wrap gap-3 justify-end;
}
.time-btn {
  @apply min-w-[72px] h-8 px-3 text-[12px];
}

/* пустое состояние */
.cinema-empty {
  @apply text-[13px] opacity-70;
}

/* скроллбар в наших цветах */
.cinema-sessions::-webkit-scrollbar {
  width: 6px;
}
.cinema-sessions::-webkit-scrollbar-track {
  background: transparent;
}
.cinema-sessions::-webkit-scrollbar-thumb {
  background-color: var(--muted);
  border-radius: 999px;
}
.cinema-sessions::-webkit-scrollbar-thumb:hover {
  background-color: var(--border);
}
.cinema-sessions {
  scrollbar-width: thin;
  scrollbar-color: var(--muted) transparent;
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
</style>
