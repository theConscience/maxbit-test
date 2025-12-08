<template>
  <section class="page movies" aria-labelledby="movies-title">
    <h1 class="page__title mb-4 hidden">Фильмы</h1>

    <UiTable
      :columns="columns"
      :items="movies"
      :loading="pending"
      :error-text="error ? 'Не удалось загрузить фильмы' : null"
      caption="Список фильмов с продолжительностью и рейтингом"
      min-width-class="min-w-[720px] lg:min-w-[640px]"
      max-body-height-class="max-h-[568px]"
      sticky-header
      align-middle
    >
      <!-- title c мини-постером -->
      <template #cell-title="{ item }">
        <div class="media">
          <img
            v-if="item.posterUrl"
            :src="item.posterUrl"
            :alt="`Постер: ${item.title}`"
            :title="`ПостерЖ ${item.title}`"
            class="media__thumb-img"
            loading="lazy"
            decoding="async"
            width="28"
            height="28"
          />
          <div v-else class="media__thumb movies-thumb">
            <Icon name="app:i-movie-poster" class="movies-thumb__icon" aria-hidden="true" />
          </div>
          <span class="media__title movies-title">
            {{ item.title }}
          </span>
        </div>
      </template>

      <template #cell-duration="{ item }">
        {{ toHm(item.durationMin) }}
      </template>

      <template #cell-rating="{ item }">
        {{ (item.rating ?? 0).toFixed(2) }}
      </template>

      <template #cell-action="{ item }">
        <div class="flex justify-end">
          <UiButton :to="`/movies/${item.id}`" variant="outline" size="sm" class="w-[136px]">
            Посмотреть сеансы
          </UiButton>
        </div>
      </template>

      <template #empty>Фильмы не найдены.</template>
    </UiTable>

  </section>
</template>


<script setup lang="ts">
const catalog = useCatalogStore()
const { movies, pending, error } = storeToRefs(catalog)
import type { UiTableColumn } from '@/types/ui-table'

onMounted(() => {
  catalog.fetchMovies()
})

function toHm(min?: number) {
  if (!min || min <= 0) return '—'
  const h = Math.floor(min / 60)
  const m = String(min % 60).padStart(2, '0')
  return `${h}:${m}`
}

const columns: UiTableColumn[] = [
  {
    key: 'title',
    header: 'Название',
    thClass: 'pl-[32px] pr-4 text-right',
    cellClass: 'pl-[32px] pr-4',
    widthClass: 'table__col-main',
  },
  {
    key: 'duration',
    header: 'Продолжительность',
    thClass: 'px-4',
    cellClass: 'px-4 text-center',
    widthClass: 'table__col-narrow',
  },
  {
    key: 'rating',
    header: 'Рейтинг',
    thClass: 'px-4',
    cellClass: 'px-4',
    widthClass: 'table__col-thin',
  },
  {
    key: 'action',
    header: '',
    thClass: 'pr-20 text-right',
    cellClass: 'pr-[24px]',
    widthClass: 'table__col-medium',
    align: 'right',
  },
]
</script>


<style scoped lang="postcss">
/* ширины колонок (через colgroup) */
/* :deep(.table__col-main) { } */
:deep(.table__col-medium) {
  width: 172px;
}
:deep(.table__col-narrow) {
  width: 176px;
}
@screen lg {
  :deep(.table__col-narrow) {
    width: 104px;
  }
}
:deep(.table__col-thin) {
  width: 88px;
}

/* переносы для названия */
.movies-title {
  white-space: normal;
  word-break: break-word;
}

/* мини-заглушка */
.movies-thumb {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  flex-shrink: 0;
  margin-right: 8px;
}
.movies-thumb__icon {
  width: 100%;
  height: 100%;
  color: var(--fg);
  --stroke: 3;
  opacity: 1.0;
}


/* /1* пустое состояние *1/ */
/* .movies-empty { */
/*   margin-top: 16px; */
/*   font-size: 13px; */
/*   opacity: 0.7; */
/* } */

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
