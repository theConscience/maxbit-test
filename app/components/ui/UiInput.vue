<template>
  <div class="field" :class="{ 'field--error': !!error }">
    <label v-if="label" class="field__label" :for="id">{{ label }}</label>

    <div class="field__control">
      <input
        :id="id"
        :type="type"
        :name="name || id"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :value="modelValue"
        class="input"
        @input="onInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      <span v-if="errorIcon && error" class="field__icon" aria-hidden="true">!</span>
    </div>

    <p v-if="hint && !error" class="field__hint">{{ hint }}</p>
    <p v-if="error" class="field__error">{{ error }}</p>
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
function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<style scoped>
.field {
  display: grid;
  gap: 0.25rem;
}
.field__label {
  font-size: 0.875rem;
  opacity: 0.8;
}
.field__control {
  position: relative;
}
.input {
  width: 100%;
  height: 40px;
  border-radius: 6px;
  padding: 0 0.95rem;
  background: transparent;
  color: var(--fg);
  border: 1px solid var(--border);
  outline: none;
}
.input::placeholder {
  opacity: 0.5;
}
.input:focus {
  border-color: var(--border-strong);
  box-shadow: 0 0 0 2px var(--border-strong);
}
.field--error .input {
  border-color: var(--error-border);
  box-shadow: none;
}
.field__icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--error);
  font-size: 0.85rem;
  user-select: none;
}
.field__hint {
  font-size: 0.75rem;
  opacity: 0.6;
}
.field__error {
  font-size: 0.75rem;
  color: var(--error);
}
</style>
