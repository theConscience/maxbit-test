<template>
  <section>
    <h1 class="card__title mb-4">Выбор мест</h1>

    <div v-if="pending" class="py-6"><UiSpinner /></div>
    <UiAlert v-else-if="error" type="error" text="Не удалось загрузить данные сеанса" />

    <div v-else>
      <SeatMap
        :rows="session?.seats?.rows || 0"
        :cols="session?.seats?.cols || 0"
        :booked="session?.bookedSeats || []"
        v-model:selected="selected"
      />
      <div class="mt-4 flex gap-3">
        <UiButton v-if="!isAuthed" :to="`/auth/login?next=${route.fullPath}`" label="Войти, чтобы забронировать" />
        <UiButton v-else :disabled="!selected.length" @click="book" label="Забронировать" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()
const auth = useAuthStore()
const isAuthed = computed(() => !!auth.token)

const bookings = useBookingsStore()
const catalog = useCatalogStore()

const session = computed(() => catalog.session)
const pending = computed(() => catalog.pending)
const error = computed(() => catalog.error)
const selected = ref<{row:number,col:number}[]>([])

onMounted(() => catalog.fetchSession(route.params.id as string))

async function book() {
  await bookings.bookSeats(session.value!.id, selected.value)
  navigateTo('/tickets')
}
</script>
