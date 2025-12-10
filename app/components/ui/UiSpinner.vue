<template>
  <span
    class="spinner"
    :class="[`spinner--${size}`, { 'spinner--inline': inline }]"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
type SpinnerSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    size?: SpinnerSize
    inline?: boolean
  }>(),
  {
    size: 'md',
    inline: false,
  },
)

const { size, inline } = toRefs(props)
</script>

<style scoped lang="postcss">
.spinner {
  @apply inline-block rounded-full;
  border-style: solid;
  border-color: var(--muted, #dcdcdc);
  border-top-color: var(--accent, #0b0f12);
  animation: spinner-rotate 0.6s linear infinite;
}

/* размеры */
.spinner--sm {
  @apply w-4 h-4;
  border-width: 2px;
}

.spinner--md {
  @apply w-5 h-5;
  border-width: 2px;
}

.spinner--lg {
  @apply w-7 h-7;
  border-width: 3px;
}

/* если когда-нибудь захочется инлайн-режим — класс уже есть */
.spinner--inline {
  @apply align-middle;
}

@keyframes spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
