<template>
  <section class="page auth login">
    <h1 class="page__title mb-6">Вход</h1>

    <form class="grid justify-items-center gap-4 max-w-[360px]" @submit.prevent="onSubmit">
      <UiInput
        label="Логин"
        v-model="username"
        placeholder="Введите логин"
        autocomplete="username"
        class="w-[272px]"
        :error="errUser"
        @blur="errUser = validateUsername(username) ? false : 'Введите логин (не менее 8 символов)'"
      />

      <UiInput
        label="Пароль"
        type="password"
        v-model="password"
        placeholder="Введите пароль"
        autocomplete="current-password"
        class="w-[272px]"
        :error="errPass"
        @blur="
          errPass = validatePassword(password) ? false : 'Введите пароль (≥8, 1 заглавная, 1 цифра)'
        "
      />

      <p v-if="errAuth" class="field__error">{{ errAuth }}</p>

      <UiButton variant="outline" class="mt-2 w-[168px]">Войти</UiButton>
    </form>

    <p class="mt-6 text-base">
      Если у вас нет аккаунта —
      <NuxtLink class="link" to="/auth/register">зарегистрируйтесь</NuxtLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import { validateUsername, validatePassword } from '@/utils/validators'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')

const errAuth = ref<string>() // общая ошибка авторизации
const errUser = ref<string | false>(false) // поле "логин"
const errPass = ref<string | false>(false) // поле "пароль"

function validateFields() {
  errUser.value = validateUsername(username.value) ? false : 'Введите логин (не менее 8 символов)'
  errPass.value = validatePassword(password.value)
    ? false
    : 'Введите пароль (≥8, 1 заглавная, 1 цифра)'
  return !errUser.value && !errPass.value
}

async function onSubmit() {
  errAuth.value = undefined
  if (!validateFields()) return

  try {
    await auth.login(username.value, password.value)
    router.push((route.query.next as string) || '/tickets')
  } catch {
    errAuth.value = 'Неверный логин или пароль. Проверьте введённые данные и попробуйте снова'
  }
}
</script>


<style scoped lang="postcss">
.auth {
  /* правая колонка по макету, но без жёстких позиций: компактная колонка */
  display: grid;
  justify-items: center;
}
.field__error {
  @apply text-sm text-error;
}
</style>
