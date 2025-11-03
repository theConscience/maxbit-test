<script setup lang="ts">
import { validateUsername, validatePassword } from '@/utils/validators'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const err = ref<string>()

async function onSubmit() {
  err.value = undefined

  if (!validateUsername(username.value)) {
    err.value = 'Введите логин (не менее 8 символов)'
    return
  }
  if (!validatePassword(password.value)) {
    err.value = 'Введите пароль (≥8, 1 заглавная, 1 цифра)'
    return
  }

  try {
    await auth.login(username.value, password.value)
    router.push((route.query.next as string) || '/tickets')
  } catch {
    err.value = 'Неверный логин или пароль. Проверьте введенные данные и попробуйте снова'
  }
}
</script>

<template>
  <section class="card max-w-lg mx-auto">
    <h1 class="card__title mb-6">Вход</h1>

    <form class="grid gap-4" @submit.prevent="onSubmit">
      <UiInput
        label="Логин"
        v-model="username"
        placeholder="Введите логин"
        autocomplete="username"
        :error="false"
      />
      <UiInput
        label="Пароль"
        type="password"
        v-model="password"
        placeholder="Введите пароль"
        autocomplete="current-password"
        :error="err ? 'Введите пароль' : false"
      />

      <p v-if="err" class="field__error">{{ err }}</p>

      <UiButton variant="outline" class="mt-2">Войти</UiButton>
    </form>

    <p class="mt-6 text-base">
      Если у вас нет аккаунта —
      <NuxtLink class="link" to="/auth/register">зарегистрируйтесь</NuxtLink>
    </p>
  </section>
</template>

<style scoped lang="postcss">
.field__error { @apply text-sm text-red-400; }
</style>
