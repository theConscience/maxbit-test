// <template>
//   <component
//     :is="to ? 'NuxtLink' : 'button'"
//     :to="to"
//     class="btn"
//     :class="variant === 'outline' ? 'btn--outline' : 'btn--solid'"
//     :disabled="disabled"
//     v-bind="$attrs"
//     @click="$emit('click', $event)"
//   >
//     <slot>{{ label }}</slot>
//   </component>
// </template>

// <script setup lang="ts">
// defineProps<{
//   label?: string
//   to?: string
//   variant?: 'solid' | 'outline'
//   disabled?: boolean
// }>()
// defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
// </script>

// <style scoped lang="postcss">
// .btn {
//   @apply inline-flex items-center justify-center px-4 py-2 rounded-xl
//          disabled:opacity-50 disabled:pointer-events-none;
// }

// /* Сплошная кнопка на акцентном цвете из токенов */
// .btn--solid {
//   @apply text-accent-contrast bg-accent;
//   background: var(--accent);
// }
// .btn--solid:hover { filter: brightness(0.96); }

// /* Обводочная, как в макете */
// .btn--outline {
//   @apply border rounded-md;
//   border-color: #fff;
// }
// .btn--outline:hover { background: color-mix(in srgb, #fff 10%, transparent); }
// </style>

<template>
  <component
    :is="to ? 'NuxtLink' : 'button'"
    :to="to"
    class="btn"
    :class="variant === 'outline' ? 'btn--outline' : 'btn--solid'"
    :disabled="disabled"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <slot>{{ label }}</slot>
  </component>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  to?: string
  variant?: 'solid' | 'outline'
  disabled?: boolean
}>()
defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
</script>

<style scoped lang="postcss">
.btn {
  @apply inline-flex items-center justify-center px-4 py-2 rounded-xl
         disabled:opacity-50 disabled:pointer-events-none;
}

/* Сплошная кнопка на акцентном цвете из токенов */
.btn--solid {
  @apply text-accent-contrast bg-accent;
  background: var(--accent);
}
.btn--solid:hover { filter: brightness(0.96); }

/* Обводочная, как в макете */
.btn--outline {
  @apply border rounded-md;
  border-color: #fff;
}
.btn--outline:hover { background: color-mix(in srgb, #fff 10%, transparent); }
</style>
