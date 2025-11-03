<script setup lang="ts">
import { validateUsername, validatePassword } from '@/utils/validators'
const router = useRouter()
const auth = useAuthStore()
const username = ref('')
const password = ref('')
const confirm = ref('')
const err = ref<string>()
async function onSubmit() {
  if (!validateUsername(username.value)) {
    err.value = 'Логин: минимум 8 символов'
    return
  }
  if (!validatePassword(password.value)) {
    err.value = 'Пароль: ≥8, 1 заглавная, 1 цифра'
    return
  }
  if (password.value !== confirm.value) {
    err.value = 'Пароли должны совпадать'
    return
  }
  await auth.register(username.value, password.value)
  router.push('/tickets') // по ТЗ — сразу на «Мои билеты»
}
</script>

<template>
  <section class="card max-w-md mx-auto">
    <h1 class="card__title mb-4">Регистрация</h1>
    <form class="grid gap-3" @submit.prevent="onSubmit">
      <UiInput label="Логин" v-model="username" />
      <UiInput label="Пароль" type="password" v-model="password" />
      <UiInput label="Подтверждение пароля" type="password" v-model="confirm" />
      <p v-if="err" class="field__error">{{ err }}</p>
      <UiButton variant="outline" class="mt-2">Зарегистрироваться</UiButton>
    </form>
  </section>
</template>
