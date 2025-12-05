<template>
  <!-- header -->
  <div v-if="errorText" class="py-2">
    <UiAlert type="error" :text="errorText" />
  </div>
  <div v-else-if="loading" class="py-4">
    <UiSpinner />
  </div>

  <div class="ui-table" :class="scrollHeightClass" role="region" aria-live="polite">
    <table class="ui-table__table" :class="[tableMinWidth, clsTableMods]">
      <caption v-if="caption" class="sr-only">
        {{ caption }}
      </caption>

      <colgroup v-if="hasWidthClasses">
        <col v-for="col in columns" :key="col.key" :class="col.widthClass" />
      </colgroup>

      <thead class="ui-table__head">
        <tr class="ui-table__head-row">
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            class="ui-table__th"
            :class="[col.thClass, cellAlignClass(col.align)]"
          >
            <slot :name="`th-${col.key}`">
              {{ col.header }}
            </slot>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(item, rowIdx) in items"
          :key="item.id ?? rowIdx"
          class="ui-table__row"
          @click="$emit('row-click', item)"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="ui-table__td"
            :class="[col.cellClass, cellAlignClass(col.align)]"
          >
            <slot :name="`cell-${col.key}`" :item="item">
              {{ item[col.key] ?? '—' }}
            </slot>
          </td>
        </tr>

        <tr v-if="!items.length">
          <td :colspan="columns.length" class="ui-table__empty">
            <slot name="empty">{{ emptyText || 'Пусто' }}</slot>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- <p v-if="!items.length" class="ui-table__is-empty">Фильмы не найдены.</p> -->

    <!-- <!-1- Линия под заголовком, которая не исчезает при sticky + first-col -1-> -->
    <!-- <div v-if="stickyHeader" class="ui-table__head-underline"></div> -->
  </div>
</template>


<script setup lang="ts">
/**
 * Универсальный табличный контейнер.
 */

import { computed } from 'vue'
import type { UiTableColumn } from '@/types/ui-table'

const props = defineProps<{
  /** подпись для a11y */
  caption?: string
  /** конфиги колонок */
  columns: UiTableColumn[]
  /** данные внутри таблицы */
  items: any[]
  /** высота прокручиваемой области, напр. 'max-h-[568px]' */
  maxBodyHeightClass?: string
  /** включить липкую первую колонку */
  fixedFirstCol?: boolean
  /** включить липкий заголовок */
  stickyHeader?: boolean
  /** вертикальное выравнивание по середине ячеек */
  alignMiddle?: boolean
  /** min-width таблицы (для горизонтального скролла), напр. 'min-w-[720px]' */
  minWidthClass?: string
  /** скелет/лоадер */
  loading?: boolean
  /** текст ошибки */
  errorText?: string | null
  /** текст «пусто» */
  emptyText?: string
}>()

const emit = defineEmits<{
  (e: 'row-click', item: any): void
}>()

function cellAlignClass(align?: UiTableColumn['align']) {
  if (align === 'center') return 'text-center'
  if (align === 'right') return 'text-right'
  return 'text-left'
}

const hasWidthClasses = computed(() => props.columns.some((col) => !!col.widthClass))

const scrollHeightClass = computed(() => props.maxBodyHeightClass || 'max-h-[568px]')

const tableMinWidth = computed(() => props.minWidthClass || 'min-w-[720px]')

const clsTableMods = computed(() => ({
  'ui-table--sticky-first': !!props.fixedFirstCol,
  'ui-table--sticky-head': !!props.stickyHeader,
  'ui-table--align-middle': !!props.alignMiddle,
}))
</script>


<style scoped lang="postcss">
/* Контейнер прокрутки */
.ui-table {
  @apply relative w-full overflow-y-auto overflow-x-auto pr-1;
  scrollbar-width: thin;
  scrollbar-color: var(--muted) transparent;
}
/* @screen lg { */
/*   .ui-table { */
/*     @apply overflow-x-hidden; */
/*   } */
/* } */

/* Стилистический скроллбар */
.ui-table::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.ui-table::-webkit-scrollbar-track {
  background: transparent;
}
.ui-table::-webkit-scrollbar-thumb {
  background-color: var(--muted);
  border-radius: 999px;
}
.ui-table::-webkit-scrollbar-thumb:hover {
  background-color: var(--border);
}


/* База таблицы */
.ui-table__table {
  @apply w-full table-fixed border-collapse;
}

/* Заголовок */
.ui-table__head {
  position: relative;

  & th {
    &::after {
      content: '';
      position: absolute;
      z-index: 10;
      /* left: 40px; /1* как в макете *1/ */
      /* right: 80px; /1* как в макете *1/ */
      left: 0;
      right: 0;
      bottom: 0;
      height: 1px;
      background: var(--border-strong);
    }
  }
}

.ui-table__head-row {
  /* линия под заголовком по умолчанию */
  box-shadow: inset 0 -1px 0 0 var(--border-strong);
}

.ui-table__row {
  border-top: 0;
}

.ui-table__th {
  @apply text-[14px] leading-[1.2] font-normal py-3 break-words bg-bg;

  .ui-table--align-middle & {
    @apply align-middle
  }
}
.ui-table__td {
  @apply text-[16px] leading-[1.2] font-normal py-4 break-words align-top bg-bg;

  .ui-table--align-middle & {
    @apply align-middle
  }
}

/* Пустая строка */
.ui-table__empty {
  @apply py-6 text-center text-sm opacity-70;
}

.ui-table__is-empty {
  margin-top: 16px;
  font-size: 13px;
  opacity: 0.7;
}

/* ===== Sticky header ===== */
.ui-table--sticky-head .ui-table__head th {
  position: sticky;
  top: 0;
  z-index: 3; /* выше липкой первой колонки */
  background: var(--bg);
}

/* /1* отдельная «подчеркивающая» линия под thead, фиксируется вместе с ним *1/ */
/* .ui-table__head-underline { */
/*   position: sticky; */
/*   top: calc(0px + var(--ui-table-head-offset, 0px)); */
/*   left: 0; */
/*   right: 0; */
/*   height: 1px; */
/*   background: var(--border-strong); */
/*   z-index: 2; /1* под thead (z=3), но над телом *1/ */
/*   pointer-events: none; */
/* } */

/* ===== Sticky первая колонка ===== */
.ui-table--sticky-first :is(th:first-child, td:first-child) {
  position: sticky;
  left: 0;
  z-index: 4; /* выше остальных ячеек и даже sticky head (у head z=3) */
  background: var(--bg);
  box-shadow: 1px 0 0 0 var(--border); /* разделительная вертикальная линия справа */
}

/* Если одновременно sticky head + sticky first, для ячейки заголовка (пересечение) чутка выше */
.ui-table--sticky-head.ui-table--sticky-first thead th:first-child {
  z-index: 5;
}

/* sr-only (если глобального нет) */
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
