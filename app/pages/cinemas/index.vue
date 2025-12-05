<template>
  <section class="page cinemas" aria-labelledby="cinemas-title">
    <h1 class="page__title mb-4 hidden">Кинотеатры</h1>

    <UiTable
      :columns="columns"
      :items="cinemas"
      :loading="pending"
      :error-text="error ? 'Не удалось загрузить кинотеатры' : null"
      caption="Список кинотеатров"
      min-width-class="min-w-[720px]"
      max-body-height-class="max-h-[568px]"
      sticky-header
      fixed-first-col
      align-middle
    >
      <!-- Название (первая колонка) -->
      <template #cell-title="{ item }">
        <div class="media">
          <span class="whitespace-normal break-words">
            {{ item.title }}
          </span>
        </div>
      </template>

      <!-- Адрес -->
      <template #cell-address="{ item }">
        {{ item.address || '—' }}
      </template>

      <!-- Кнопка действия -->
      <template #cell-action="{ item }">
        <div class="flex justify-end">
          <UiButton
            :to="`/cinemas/${item.id}`"
            variant="outline"
            size="sm"
            class="w-[136px]"
          >
            Посмотреть сеансы
          </UiButton>
        </div>
      </template>

      <template #empty>Кинотеатры не найдены.</template>
    </UiTable>

    <!-- <div v-if="pending" class="py-6"> -->
    <!--   <UiSpinner /> -->
    <!-- </div> -->

    <!-- <UiAlert -->
    <!--   v-else-if="error" -->
    <!--   type="error" -->
    <!--   text="Не удалось загрузить кинотеатры" -->
    <!-- /> -->

    <!-- <div v-else class="cinemas-table-wrap" aria-label="Список кинотеатров"> -->
    <!--   <table class="table cinemas-table"> -->
    <!--     <caption class="sr-only"> -->
    <!--       Список кинотеатров -->
    <!--     </caption> -->
    <!--     <colgroup> -->
    <!--       <col> -->
    <!--       <col class="table__col-narrow"> -->
    <!--       <col> -->
    <!--     </colgroup> -->
    <!--     <thead> -->
    <!--       <tr> -->
    <!--         <th scope="col" class="table__th pl-5 pr-4">Кинотеатр</th> -->
    <!--         <th scope="col" class="table__th px-4">Адрес</th> -->
    <!--         <th scope="col" class="table__th pr-6 text-right"></th> -->
    <!--       </tr> -->
    <!--     </thead> -->

    <!--     <tbody> -->
    <!--       <tr v-for="с in cinemas" :key="с.id" class="table__row"> -->
    <!--         <!-1- Название + пиктограмма -1-> -->
    <!--         <td class="table__td pl-5 pr-4 align-top"> -->
    <!--           <div class="media"> -->
    <!--             <span class="whitespace-normal break-words"> -->
    <!--               {{ с.title }} -->
    <!--             </span> -->
    <!--           </div> -->
    <!--         </td> -->

    <!--         <!-1- Адрес -1-> -->
    <!--         <td class="table__td px-4"> -->
    <!--           {{ с.address || '—' }} -->
    <!--         </td> -->

    <!--         <!-1- Кнопка -1-> -->
    <!--         <td class="table__td pr-6"> -->
    <!--           <div class="flex justify-end"> -->
    <!--             <UiButton -->
    <!--               :to="`/cinemas/${с.id}`" -->
    <!--               variant="outline" -->
    <!--               size="sm" -->
    <!--               class="w-[136px]" -->
    <!--             > -->
    <!--               Посмотреть сеансы -->
    <!--             </UiButton> -->
    <!--           </div> -->
    <!--         </td> -->
    <!--       </tr> -->
    <!--     </tbody> -->
    <!--   </table> -->
    <!-- </div> -->
  </section>
</template>

<script setup lang="ts">
import type { UiTableColumn } from '@/types/ui-table'

const catalog = useCatalogStore()
const { cinemas, pending, error } = storeToRefs(catalog)

onMounted(() => {
  catalog.fetchCinemas()
})

const columns: UiTableColumn[] = [
  {
    key: 'title',
    header: 'Кинотеатр',
    thClass: 'pl-5 pr-4',
    cellClass: 'pl-5 pr-4 align-top',
    // ширину первой колонки оставляем авто (без widthClass), чтобы она занимала свободное
  },
  {
    key: 'address',
    header: 'Адрес',
    thClass: 'px-4',
    cellClass: 'px-4',
    widthClass: 'table__col-narrow', // делаем колонку средней ширины
  },
  {
    key: 'action',
    header: '',
    thClass: 'pr-6 text-right',
    cellClass: 'pr-6',
    align: 'right',
    // widthClass можно не задавать — кнопка сама компактная,
    // но при желании можно зафиксировать ширину отдельным классом
  },
]
</script>

<style scoped lang="postcss">
.page {
  /* правая колонка по макету, но без жёстких позиций: компактная колонка */
  display: grid;
  justify-items: center;
}

/* размеры колонок через colgroup (подключаются из widthClass) */
:deep(.table__col-narrow) {
  width: calc(8px * 36);
}

/* /1* обёртка: фиксируем высоту, только вертикальный скролл *1/ */
/* .cinemas-table-wrap { */
/*   @apply w-full max-h-[568px] overflow-y-auto overflow-x-auto pr-1; */
/* } */
/* @screen lg { */
/*   .cinemas-table-wrap { */
/*     @apply overflow-x-hidden; */
/*   } */
/* } */

/* /1* сама таблица не шире контейнера *1/ */
/* .cinemas-table { */
/*   @apply w-full table-fixed border-collapse min-w-[720px]; */
/* } */
/* @screen lg { */
/*   .cinemas-table { */
/*     min-width: 0; /1* сбросили min-width *1/ */
/*   } */
/* } */

/* .cinemas-thumb__icon { */
/*   width: 22px; */
/*   height: 22px; */
/*   opacity: 0.6; */
/* } */

/* .table__col-narrow { */
/*   width: calc(8px * 36); */
/* } */
</style>
