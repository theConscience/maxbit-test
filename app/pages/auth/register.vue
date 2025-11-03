<script setup lang="ts">
import { validateUsername, validatePassword } from '@/utils/validators'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const confirm = ref('')

const err = ref<string>()

async function onSubmit() {
  err.value = undefined

  if (!validateUsername(username.value)) {
    err.value = 'Логин: минимум 8 символов'
    return
  }
  if (!validatePassword(password.value)) {
    err.value = 'Пароль: ≥8, 1 заглавная, 1 цифра'
    return
  }
  if (password.value !== confirm.value) {
    err.value = 'Пароли не совпадают'
    return
  }

  await auth.register(username.value, password.value)
  router.push('/tickets')
}
</script>

<template>
  <section class="card max-w-lg mx-auto">
    <h1 class="card__title mb-6">Регистрация</h1>

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
        autocomplete="new-password"
        :error="false"
      />

      <UiInput
        label="Пароль"
        type="password"
        v-model="confirm"
        placeholder="Повторите пароль"
        autocomplete="new-password"
        :error="err ? 'Пароль не совпадает' : false"
      />

      <p v-if="err" class="field__error">{{ err }}</p>

      <UiButton variant="outline" class="mt-2">Зарегистрироваться</UiButton>
    </form>

    <p class="mt-6 text-base">
      Если вы уже зарегистрированы —
      <NuxtLink class="link" to="/auth/login">войдите</NuxtLink>
    </p>
  </section>
</template>

<style scoped lang="postcss">
.field__error {
  @apply text-sm text-red-400;
}
</style>
