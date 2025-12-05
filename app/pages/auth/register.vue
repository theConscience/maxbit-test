<template>
  <section class="page auth register">
    <h1 class="page__title mb-6">Регистрация</h1>

    <form class="grid gap-4 max-w-[360px]" @submit.prevent="onSubmit">
      <UiInput
        label="Логин"
        v-model="username"
        placeholder="Введите логин"
        autocomplete="username"
        :error="errUser"
        @blur="errUser = validateUsername(username) ? false : 'Логин: минимум 8 символов'"
      />

      <UiInput
        label="Пароль"
        type="password"
        v-model="password"
        placeholder="Введите пароль"
        autocomplete="new-password"
        :error="errPass"
        @blur="errPass = validatePassword(password) ? false : 'Пароль: ≥8, 1 заглавная, 1 цифра'"
      />

      <UiInput
        label="Повторите пароль"
        type="password"
        v-model="confirm"
        placeholder="Повторите пароль"
        autocomplete="new-password"
        :error="errConf"
        @blur="errConf = password === confirm ? false : 'Пароли не совпадают'"
      />

      <p v-if="errAuth" class="field__error">{{ errAuth }}</p>

      <UiButton variant="outline" class="mt-2 w-[200px]">Зарегистрироваться</UiButton>
    </form>

    <p class="mt-6 text-base">
      Если вы уже зарегистрированы — <NuxtLink class="link" to="/auth/login">войдите</NuxtLink>
    </p>
  </section>
</template>


<script setup lang="ts">
import { validateUsername, validatePassword } from '@/utils/validators'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const confirm = ref('')

const errUser = ref<string | false>(false)
const errPass = ref<string | false>(false)
const errConf = ref<string | false>(false)
const errAuth = ref<string>() // на всякий случай (например, 409)

function validateFields() {
  errUser.value = validateUsername(username.value) ? false : 'Логин: минимум 8 символов'
  errPass.value = validatePassword(password.value) ? false : 'Пароль: ≥8, 1 заглавная, 1 цифра'
  errConf.value = password.value === confirm.value ? false : 'Пароли не совпадают'
  return !errUser.value && !errPass.value && !errConf.value
}

async function onSubmit() {
  errAuth.value = undefined
  if (!validateFields()) return

  try {
    await auth.register(username.value, password.value)
    router.push('/tickets')
  } catch (e) {
    errAuth.value = 'Не удалось зарегистрировать пользователя'
  }
}
</script>


<style scoped lang="postcss">
.auth {
  display: grid;
  justify-items: center;
}
.field__error {
  @apply text-sm text-error;
}
</style>
