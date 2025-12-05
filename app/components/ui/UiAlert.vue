<template>
  <div
    class="alert"
    :class="`alert--${type}`"
    role="alert"
  >
    <span
      v-if="showIcon"
      class="alert__icon"
      aria-hidden="true"
    />
    <p class="alert__text">
      <slot>{{ text }}</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
type AlertType = 'info' | 'success' | 'warning' | 'error'

const props = withDefaults(
  defineProps<{
    type?: AlertType
    text?: string
    showIcon?: boolean
  }>(),
  {
    type: 'info',
    text: '',
    showIcon: true,
  },
)

const { type, text, showIcon } = toRefs(props)
</script>

<style scoped lang="postcss">
.alert {
  @apply text-[13px] leading-snug flex items-start gap-2;
  padding: 8px 12px;
  border-radius: 8px;
  border-width: 1px;
  border-style: solid;
  border-color: var(--border);
  background: color-mix(in srgb, var(--bg, #ffffff) 6%, transparent);
}

/* Варианты */

.alert--error {
  color: var(--error, #a26462);
  border-color: var(--error-border, #8a5452);
  background: color-mix(in srgb, var(--error, #a26462) 8%, transparent);
}

.alert--warning {
  color: var(--accent, #0b0f12);
  border-color: var(--border-strong, #000000);
  background: color-mix(in srgb, #f97316 10%, transparent);
}

.alert--success {
  color: var(--accent, #0b0f12);
  border-color: var(--border, #bdbdbd);
  background: color-mix(in srgb, #16a34a 10%, transparent);
}

.alert--info {
  color: var(--accent, #0b0f12);
  border-color: var(--border, #bdbdbd);
  background: color-mix(in srgb, var(--accent, #0b0f12) 6%, transparent);
}

/* Иконка: маленький кружок с "!" */

.alert__icon {
  position: relative;
  margin-top: 2px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid currentColor;
  flex-shrink: 0;
}

.alert__icon::before,
.alert__icon::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  border-radius: 999px;
  background-color: currentColor;
}

.alert__icon::before {
  top: 3px;
  height: 6px;
}

.alert__icon::after {
  bottom: 3px;
  height: 2px;
}

/* Текст */

.alert__text {
  @apply m-0;
}
</style>
