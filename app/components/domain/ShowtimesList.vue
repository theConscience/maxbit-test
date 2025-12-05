<template>
  <section class="stl" :aria-label="caption || 'Сеансы'">
    <p v-if="!sessions?.length" class="stl__empty">{{ emptyText || 'Нет доступных сеансов.' }}</p>

    <div v-else class="stl__scroll" :class="maxH">
      <ul class="stl__date-list">
        <li v-for="dateBlock in blocks" :key="(dateBlock as any).date" class="stl__date-item">
          <div class="stl__date">{{ (dateBlock as any).date }}</div>

          <ul v-if="'films' in dateBlock" class="stl__entity-list">
            <li v-for="film in (dateBlock as any).films" :key="film.title" class="stl__row">
              <div class="stl__entity">
                <!-- TODO: make custom component from image & thumb combination -->
                <img
                  v-if="film.posterUrl"
                  :src="film.posterUrl"
                  :alt="`Постер: ${film.title}`"
                  :title="`ПостерЖ ${film.title}`"
                  class="stl__thumb-img"
                  loading="lazy"
                  decoding="async"
                  width="28"
                  height="28"
                />
                <div v-else class="stl__thumb" aria-hidden="true">
                  <Icon name="app:i-movie-poster" class="stl__thumb-icon" />
                </div>
                <div class="stl__entity-title">{{ film.title }}</div>
              </div>

              <ul class="stl__time-list">
                <li v-for="s in film.sessions" :key="s.id" class="stl__time-item">
                  <UiButton
                    :to="`/sessions/${s.id}`"
                    variant="outline"
                    size="sm"
                    class="stl__time-btn"
                  >
                    <span class="sr-only">{{ film.title }}, {{ (dateBlock as any).date }}, </span>
                    {{ new Date(s.startsAt).toLocaleTimeString().slice(0, 5) }}
                  </UiButton>
                </li>
              </ul>
            </li>
          </ul>

          <ul v-else class="stl__entity-list">
            <li v-for="cinema in (dateBlock as any).cinemas" :key="cinema.name" class="stl__row">
              <div class="stl__entity">
                <!-- <div class="stl__thumb" aria-hidden="true"> -->
                <!--   <Icon name="app:i-placeholder-2" class="stl__thumb-icon" /> -->
                <!-- </div> -->
                <div class="stl__entity-title">{{ cinema.name }}</div>
              </div>

              <ul class="stl__time-list">
                <li v-for="s in cinema.sessions" :key="s.id" class="stl__time-item">
                  <UiButton
                    :to="`/sessions/${s.id}`"
                    variant="outline"
                    size="sm"
                    class="stl__time-btn"
                  >
                    <span class="sr-only">{{ cinema.name }}, {{ (dateBlock as any).date }}, </span>
                    {{ new Date(s.startsAt).toLocaleTimeString().slice(0, 5) }}
                  </UiButton>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Session } from '@/types/api'

/**
 * Совместимый API:
 * - variant: 'byMovie' | 'byCinema'  (старое имя)
 * - groupBy: 'movie'  | 'cinema'     (новое имя, алиас)
 * - maxHeightClass / maxBodyHeightClass — оба работают
 */
type Variant = 'byMovie' | 'byCinema'

const props = defineProps<{
  sessions: Session[]

  /** СТАРОЕ имя пропа (оставлено для совместимости) */
  variant?: Variant

  /** НОВОЕ имя пропа (алиас) */
  groupBy?: 'movie' | 'cinema'

  caption?: string

  /** СТАРОЕ имя */
  maxHeightClass?: string
  /** НОВОЕ имя (алиас) */
  maxBodyHeightClass?: string

  /** Текст пустого состояния */
  emptyText?: string
}>()

/* Нормализуем пропсы */
const mode = computed<'movie' | 'cinema'>(() => {
  if (props.groupBy) return props.groupBy
  if (props.variant === 'byCinema') return 'cinema'
  // default
  return 'movie'
})

const maxH = computed(() => props.maxBodyHeightClass || props.maxHeightClass || 'max-h-[360px]')

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

/* Группировка: дата → (film|cinema) → сеансы */
type FilmBlock = { title: string; posterUrl?: string; sessions: Session[] }
type CinemaBlock = { name: string; sessions: Session[] }
type DateBlock = { date: string; films: FilmBlock[] } | { date: string; cinemas: CinemaBlock[] }

const blocks = computed<DateBlock[]>(() => {
  const map = new Map<string, any>()

  for (const s of props.sessions || []) {
    const date = toDateLabel(s.startsAt)
    let db = map.get(date)
    if (!db) {
      db = mode.value === 'movie'
        ? { date, films: [] as FilmBlock[] }
        : { date, cinemas: [] as CinemaBlock[] }
      map.set(date, db)
    }

    if (mode.value === 'movie') {
      const title = s.movieTitle || `Фильм #${s.movieId}`
      let fb = db.films.find((f: FilmBlock) => f.title === title)
      if (!fb) {
        fb = { title, posterUrl: (s as any).moviePosterUrl, sessions: [] }
        db.films.push(fb)
      }
      fb.sessions.push(s)
    } else {
      const name = s.cinemaName || `Кинотеатр #${s.cinemaId}`
      let cb = db.cinemas.find((c: CinemaBlock) => c.name === name)
      if (!cb) {
        cb = { name, sessions: [] }
        db.cinemas.push(cb)
      }
      cb.sessions.push(s)
    }
  }

  const res = Array.from(map.values()).sort((a: any, b: any) => {
    const [ad = 0, am = 0] = a.date.split('.').map(Number)
    const [bd = 0, bm = 0] = b.date.split('.').map(Number)
    return am === bm ? ad - bd : am - bm
  })

  for (const block of res) {
    if ('films' in block) {
      block.films.sort((a: FilmBlock, b: FilmBlock) => a.title.localeCompare(b.title))
      block.films.forEach((f: FilmBlock) =>
        f.sessions.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
      )
    } else {
      block.cinemas.sort((a: CinemaBlock, b: CinemaBlock) => a.name.localeCompare(b.name))
      block.cinemas.forEach((c: CinemaBlock) =>
        c.sessions.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
      )
    }
  }

  return res
})
</script>

<style scoped lang="postcss">
.stl__empty {
  @apply text-[13px] opacity-70;
}
.stl__scroll {
  @apply pr-2 overflow-y-auto;
}
.stl__scroll::-webkit-scrollbar {
  width: 6px;
}
.stl__scroll::-webkit-scrollbar-track {
  background: transparent;
}
.stl__scroll::-webkit-scrollbar-thumb {
  background-color: var(--muted);
  border-radius: 999px;
}
.stl__scroll::-webkit-scrollbar-thumb:hover {
  background-color: var(--border);
}
.stl__scroll {
  scrollbar-width: thin;
  scrollbar-color: var(--muted) transparent;
}
.stl__date-list,
.stl__entity-list,
.stl__time-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.stl__date-item + .stl__date-item {
  margin-top: 16px;
}
.stl__date {
  margin-top: 24px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-strong);
  font-size: 14px;
  line-height: 1;
}
.stl__row {
  @apply flex items-center justify-between gap-4 border-t border-border py-4;
}
.stl__entity {
  @apply flex items-center gap-3;
}
.stl__entity-title {
  font-size: 16px;
  line-height: 1;
}
.stl__thumb {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 12px;
}
.stl__thumb-icon {
  width: 100%;
  height: 100%;
  color: var(--fg);
  --stroke: 3;
  opacity: 1.0;
}

.stl__thumb-img {
  /* width: 100%; */
  width: 96px;
  height: 100%;
  object-fit: cover;
  border-radius: 4px; /* чуть меньше, чем контейнер, чтобы не «выпирал» */
  background-color: transparent;
  padding: 4px;
  text-align: center;
}
.stl__time-list {
  @apply flex flex-wrap gap-3 justify-end;
}
.stl__time-btn {
  @apply min-w-[72px] h-8 px-3 text-[12px];
}
</style>
