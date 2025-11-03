<script setup lang="ts">
import { validateUsername, validatePassword } from '@/utils/validators'
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const username = ref('')
const password = ref('')
const err = ref<string>()
async function onSubmit() {
  if (!validateUsername(username.value) || !validatePassword(password.value)) {
    err.value = 'Неверный логин или пароль. Проверьте введенные данные и попробуйте снова'
    return
  }
  try {
    await auth.login(username.value, password.value)
    router.push((route.query.next as string) || '/tickets') // по ТЗ — «Мои билеты»
  } catch {
    err.value = 'Неверный логин или пароль. Проверьте введенные данные и попробуйте снова'
  }
}
</script>

<template>
  <section class="card max-w-md mx-auto">
    <h1 class="card__title mb-4">Вход</h1>
    <form class="grid gap-3" @submit.prevent="onSubmit">
      <UiInput label="Логин" v-model="username" />
      <UiInput label="Пароль" type="password" v-model="password" />
      <p v-if="err" class="field__error">{{ err }}</p>
      <UiButton variant="outline" class="mt-2">Войти</UiButton>
    </form>
    <p class="mt-3 text-sm">
      Нет аккаунта? <NuxtLink class="link" to="/auth/register">Регистрация</NuxtLink>
    </p>
  </section>
</template>
