<template>
  <section>
    <h1 class="card__title mb-4">Мои билеты</h1>

    <div v-if="pending" class="py-6"><UiSpinner /></div>
    <UiAlert v-else-if="error" type="error" text="Не удалось загрузить билеты" />

    <div v-else class="grid grid-cols-3 gap-6">
      <div>
        <h2 class="font-semibold mb-2">Неоплаченные</h2>
        <article v-for="b in unpaid" :key="b.id" class="card mb-3">
          <p class="mb-2">Сеанс: {{ b.sessionTitle }}</p>
          <UiCountdown :deadline="deadline(b)" @end="refresh" />
          <UiButton class="mt-3" @click="pay(b.id)" label="Оплатить" />
        </article>
      </div>

      <div>
        <h2 class="font-semibold mb-2">Будущие</h2>
        <article v-for="b in upcoming" :key="b.id" class="card mb-3">
          <p>Сеанс: {{ b.sessionTitle }}</p>
        </article>
      </div>

      <div>
        <h2 class="font-semibold mb-2">Прошедшие</h2>
        <article v-for="b in past" :key="b.id" class="card mb-3">
          <p>Сеанс: {{ b.sessionTitle }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const store = useBookingsStore()
const settings = useSettingsStore()

const { unpaid, upcoming, past, pending, error } = storeToRefs(store)

onMounted(async () => {
  await Promise.all([settings.fetchSettings(), store.fetchMyBookings()])
})

function deadline(b:any) {
  const t = settings.paymentTimeoutSeconds
  return new Date(new Date(b.bookedAt).getTime() + t * 1000)
}
async function pay(id:string) { await store.pay(id); await store.fetchMyBookings() }
async function refresh() { await store.fetchMyBookings() }
</script>
