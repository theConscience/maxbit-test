<template>
  <section aria-labelledby="seatmap-title">
    <h2 id="seatmap-title" class="sr-only">Схема зала</h2>

    <div
      class="inline-grid gap-2 p-4 rounded-md border border-borderStrong bg-surface-2"
      :style="{ gridTemplateColumns: `repeat(${cols}, minmax(28px, 1fr))` }"
    >
      <button
        v-for="seat in seats"
        :key="seat.id"
        type="button"
        :aria-label="'seat'"
        :disabled="seat.booked"
        @click="toggle(seat.id)"
        class="h-7 w-7 rounded flex items-center justify-center text-[12px] leading-none border"
        :class="seatClass(seat)"
      >
        {{ seat.label }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
type SeatId = string

const props = withDefaults(
  defineProps<{
    rows: number
    cols: number
    /** занятые сервером места, выбор по ним запрещён */
    booked?: SeatId[]
    /** выбранные пользователем (v-model) */
    modelValue?: SeatId[]
  }>(),
  {
    booked: () => [],
    modelValue: () => [],
  },
)

const emit = defineEmits<{ (e: 'update:modelValue', v: SeatId[]): void }>()

const seats = computed(() => {
  const out: { id: SeatId; label: string; booked: boolean }[] = []
  for (let r = 1; r <= props.rows; r++) {
    for (let c = 1; c <= props.cols; c++) {
      const id = `${r}-${c}`
      out.push({ id, label: c.toString(), booked: props.booked!.includes(id) })
    }
  }
  return out
})

function toggle(id: SeatId) {
  if (props.booked!.includes(id)) return
  const set = new Set(props.modelValue)
  set.has(id) ? set.delete(id) : set.add(id)
  emit('update:modelValue', Array.from(set))
}

function seatClass(seat: { id: SeatId; booked: boolean }) {
  if (seat.booked) return 'bg-muted text-fg/40 border-border cursor-not-allowed'
  const active = props.modelValue!.includes(seat.id)
  return active
    ? 'bg-accent text-accent-contrast border-borderStrong'
    : 'bg-surface text-fg hover:bg-surface-2 border-border'
}
</script>
