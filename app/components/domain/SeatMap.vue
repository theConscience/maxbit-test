<template>
  <section class="w-full" aria-labelledby="seatmap-title">
    <h2 id="seatmap-title" class="sr-only">Схема зала</h2>

    <div class="seatmap-wrap w-full max-h-[360px] overflow-auto" ref="wrapRef">
      <div class="seatmap" :class="{ 'seatmap--compact': compact }">
        <!-- Экран -->
        <div class="seatmap__screen">Экран</div>

        <!-- Шапка с номерами мест (липкая по вертикали) -->
        <div class="seatmap__header">
          <div class="seatmap__corner"></div>
          <div
            class="seatmap__cols"
            :style="{ gridTemplateColumns: `repeat(${cols}, var(--seatmap-cell-size))` }"
          >
            <span
              v-for="c in cols"
              :key="c"
              class="seatmap__col-label"
            >
              {{ c }}
            </span>
          </div>
        </div>

        <!-- Тело: слева ряды (липкие по горизонтали), справа сиденья -->
        <div class="seatmap__body">
          <div
            v-for="row in rows"
            :key="row"
            class="seatmap__row"
          >
            <div class="seatmap__row-label">ряд {{ row }}</div>

            <div
              class="seatmap__row-seats"
              :style="{ gridTemplateColumns: `repeat(${cols}, var(--seatmap-cell-size))` }"
            >
              <button
                v-for="col in cols"
                :key="`${row}-${col}`"
                type="button"
                class="seatmap__cell"
                :disabled="isSeatDisabled(row, col)"
                @click="onSeatClick(row, col)"
                @mouseenter="onHover(row, col)"
                @mouseleave="onHoverEnd"
              >
                <span
                  class="seatmap__seat"
                  :class="seatClass(row, col)"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Подсказки сейчас через стор в layout -->
      </div>
    </div>
  </section>
</template>


<script setup lang="ts">
type SeatId = string

const props = withDefaults(
  defineProps<{
    rows: number
    cols: number
    booked?: SeatId[]
    modelValue?: SeatId[]
    readonly?: boolean
  }>(),
  {
    booked: () => [],
    modelValue: () => [],
    readonly: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: SeatId[]): void
}>()

const ui = useUiStatusStore()

// компактный режим для больших залов
const compact = computed(() => props.cols > 10 || props.rows > 6)

// наведённое место
const hovered = ref<{ row: number; col: number } | null>(null)

function makeId(row: number, col: number): SeatId {
  return `${row}-${col}`
}

function isBooked(row: number, col: number): boolean {
  return props.booked!.includes(makeId(row, col))
}

function isActive(row: number, col: number): boolean {
  return (props.modelValue ?? []).includes(makeId(row, col))
}

function isSeatDisabled(row: number, col: number): boolean {
  return props.readonly || isBooked(row, col)
}

function onSeatClick(row: number, col: number) {
  if (props.readonly) return
  if (isBooked(row, col)) return

  const id = makeId(row, col)
  const list = props.modelValue ?? []
  const set = new Set(list)

  set.has(id) ? set.delete(id) : set.add(id)
  emit('update:modelValue', Array.from(set))
}

function onHover(row: number, col: number) {
  hovered.value = { row, col }
}

function onHoverEnd() {
  hovered.value = null
}

function seatClass(row: number, col: number) {
  if (isBooked(row, col)) return 'seatmap__seat--booked'
  if (isActive(row, col)) return 'seatmap__seat--active'
  return 'seatmap__seat--free'
}

// место под курсором
const hoverSeat = computed(() => hovered.value)

// все выбранные места для подписи
const selectedSeats = computed(() => {
  const list = props.modelValue ?? []
  return list
    .map((id) => {
      const [rs, cs] = id.split('-')
      const row = Number(rs)
      const col = Number(cs)
      if (!Number.isFinite(row) || !Number.isFinite(col)) return null
      return { id, row, col }
    })
    .filter((x): x is { id: string; row: number; col: number } => x !== null)
})

const currentHint = ref('')

const wrapRef = ref<HTMLElement | null>(null)

function centerScroll() {
  const el = wrapRef.value
  if (!el) return

  const scrollWidth = el.scrollWidth
  const clientWidth = el.clientWidth

  // если содержимое шире контейнера — центрируем
  if (scrollWidth > clientWidth) {
    el.scrollLeft = (scrollWidth - clientWidth) / 2
  } else {
    el.scrollLeft = 0
  }
}

onMounted(async () => {
  await nextTick()
  centerScroll()
})

// если хочешь пересчитать при изменении размеров зала (на всякий случай)
watch(
  () => [props.rows, props.cols],
  async () => {
    await nextTick()
    centerScroll()
  },
)

watch(
  [hoverSeat, selectedSeats],
  ([hover, selected]) => {
    let text = ''

    if (hover) {
      text += `Наведено:<br/>Ряд ${hover.row}, место
      ${hover.col}<br/><br/>`
    }

    if (selected.length) {
      const parts = selected.map(
        (s) => `ряд ${s.row}, место ${s.col}`,
      )
      text += `Выбраны:<br/> ${parts.join('<br/> ')}`
    }

    currentHint.value = text
    ui.setNavHint(text)
  },
  { immediate: true },
)

onUnmounted(() => {
  if (ui.navHint === currentHint.value) {
    ui.clearNavHint()
  }
})
</script>

<style scoped lang="postcss">
.seatmap {
  --seatmap-cell-size: 50px;
  --seatmap-seat-size: 36px;
  --seatmap-gap-x: 8px;
  --seatmap-gap-y: 4px;

  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;

  width: max-content;
  margin-inline: auto;
}

/* компактный режим */
.seatmap--compact {
  --seatmap-cell-size: 42px;
  --seatmap-seat-size: 30px;
  --seatmap-gap-x: 4px;
}

/* экран */
.seatmap__screen {
  width: 100%;
  align-self: center;
  padding-inline: 40px;
  padding-block: 6px;
  border-radius: 100%;
  border-top: 1px solid var(--border-strong, #ffffff);
  font-size: 12px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.7;
  position: relative;
  right: -36px;
}

/* шапка — липкая по вертикали */
.seatmap__header {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  column-gap: 16px;

  position: sticky;
  top: 0;
  z-index: 20;
  padding-bottom: 4px;
  background-color: var(--bg);
}

.seatmap__corner {
  width: 60px;
  position: sticky;
  left: 0;
  z-index: 30;
  background-color: var(--bg);
}

.seatmap__cols {
  display: grid;
  column-gap: var(--seatmap-gap-x);
  justify-content: end;
}

.seatmap__col-label {
  text-align: center;
  font-size: 14px;
  background-color: var(--bg);
}

/* тело */
.seatmap__body {
  display: flex;
  flex-direction: column;
  row-gap: var(--seatmap-gap-y);
}

.seatmap__row {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 16px;
  align-items: center;
}

/* номера рядов — липкие по горизонтали */
.seatmap__row-label {
  display: flex;
  align-items: center;    /* по вертикали */
  justify-content: center; /* по горизонтали */
  min-width: 60px;
  text-align: right;
  font-size: 14px;
  min-height: 42px;
  position: sticky;
  left: 0;
  z-index: 10;
  padding-right: 8px;
  background-color: var(--bg);
}

.seatmap__row-seats {
  display: grid;
  column-gap: var(--seatmap-gap-x);
  row-gap: var(--seatmap-gap-y);
}

/* ячейка */
.seatmap__cell {
  width: var(--seatmap-cell-size);
  height: var(--seatmap-cell-size);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: none;
}

/* сиденье */
.seatmap__seat {
  width: var(--seatmap-seat-size);
  height: var(--seatmap-seat-size);
  border-radius: 5px;
  border-width: 1px;
  border-style: solid;
  border-color: var(--border-strong, #ffffff);

  transition: background-color 0.15s ease, transform 0.1s ease;
}

/* hover-анимация только для кликабельных */
.seatmap__cell:not(:disabled):hover .seatmap__seat {
  transform: scale(1.05);
}

.seatmap__seat--free {
  background: transparent;
}

.seatmap__seat--booked {
  background: #b76969;
}

.seatmap__seat--active {
  background: #154163;
}

/* .seatmap__hints { */
/*   margin-top: 4px; */
/*   max-width: 200px; */
/*   font-size: 14px; */
/*   opacity: 0.85; */
/*   display: flex; */
/*   flex-direction: column; */
/*   gap: 2px; */
/* } */
</style>
