<template>
  <div class="field" :class="{ 'field--error': !!error }">
    <!-- Лейбл над полем (10px), сдвиг на 8px от левого края поля -->
    <label v-if="label" class="field__label" :for="id">{{ label }}</label>

    <div class="field__control" :class="{ 'has-icon': errorIcon && !!error }">
      <input
        :id="id"
        :type="type"
        :name="name || id"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :value="modelValue"
        :aria-invalid="!!error"
        :aria-describedby="descrId"
        class="input"
        @input="onInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />

      <!-- Иконка ошибки: 18×18, отступы 10px, круг с '!' -->
      <span
        v-if="errorIcon && error"
        class="field__icon"
        role="img"
        aria-label="Ошибка"
        aria-hidden="true"
      >!</span>
    </div>

    <!-- Подсказка/ошибка (10px). id — для aria-describedby -->
    <p v-if="hint && !error" :id="descrId" class="field__hint">{{ hint }}</p>
    <p v-if="error" :id="descrId" class="field__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    type?: 'text' | 'password' | 'email' | 'search' | 'tel' | 'url' | 'number'
    name?: string
    placeholder?: string
    autocomplete?: string
    inputmode?: 'search' | 'text' | 'none' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal'
    id?: string
    hint?: string
    error?: string | boolean
    errorIcon?: boolean
  }>(),
  {
    modelValue: '',
    type: 'text',
    autocomplete: 'off',
    inputmode: 'text',
    errorIcon: true,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'blur', ev: FocusEvent): void
  (e: 'focus', ev: FocusEvent): void
}>()

const id = computed(() => props.id || `ui-input-${Math.random().toString(36).slice(2)}`)
const descrId = computed(() => `${id.value}-desc`)

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<style scoped lang="postcss">
/* 8-pt вертикальный ритм */
.field {
  display: grid;
  gap: 8px; /* между label/control и control/hint */
}

/* Label: 10px, смещаем на 8px от левого края поля (как в макете было 6px → нормализовали в 8) */
.field__label {
  font-size: 10px;
  line-height: 1;
  opacity: 0.8;
  margin-left: 8px;
}

/* Контейнер для input + иконка */
.field__control {
  position: relative;

  /* базовый горизонтальный паддинг для инпута */
  --pad-x: 12px;

  /* когда есть иконка ошибки — даём место справа: 10 (gap) + 18 (иконка) + 10 (правый отступ) */
  &.has-icon {
    .input {
      padding-right: calc(var(--pad-x) + 38px);
    }
  }
}

/* Поле ввода: 40px высота, 1px бордер, r=6, 8-pt паддинги */
.input {
  width: 100%;
  height: 40px; /* 5×8 */
  border-radius: 6px;
  padding: 0 var(--pad-x);
  background: transparent;
  color: var(--fg);
  border: 1px solid var(--border);
  outline: none;

  &::placeholder {
    opacity: 0.5;
  }

  &:focus {
    border-color: var(--border-strong);
    /* аккуратный ring вместо box-shadow внутри */
    box-shadow: 0 0 0 2px var(--accent);
  }
}

/* Ошибка: бордер из токена, убираем ring */
.field--error {
  .input {
    border-color: var(--error-border);
    box-shadow: none;
  }
}

/* Иконка ошибки: 18×18, отступ от текста 10px, от правого края 10px */
.field__icon {
  position: absolute;
  right: 10px;
  top: 50%;
  translate: 0 -50%;

  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;

  color: var(--error);
  font-size: 12px;
  line-height: 1;
  user-select: none;

  border: 1px solid var(--error-border);
  border-radius: 9999px; /* кружок */
}

/* Подпись/сообщение: 10px, слева от края поля отступ 8px */
.field__hint {
  font-size: 10px;
  line-height: 1;
  opacity: 0.7;
  margin-left: 8px;
}

.field__error {
  font-size: 10px;
  line-height: 1;
  color: var(--error);
  margin-left: 8px;
}
</style>
