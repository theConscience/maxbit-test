<template>
  <!-- Ссылка (если есть to и не disabled) -->
  <NuxtLink v-if="showLink" :to="to" class="btn" :class="classes" v-bind="$attrs">
    <slot>{{ label }}</slot>
  </NuxtLink>

  <!-- Кнопка (обычный fallback или disabled-состояние) -->
  <button
    v-else
    class="btn"
    :disabled="disabled"
    :class="classes"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    to?: string
    label?: string
    variant?: 'solid' | 'outline'
    disabled?: boolean
  }>(),
  {
    variant: 'outline',
    disabled: false,
  },
)

const showLink = ref(props.to && !props.disabled)

const classes = computed(() => (props.variant === 'outline' ? 'btn--outline' : 'btn--solid'))

defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
</script>

<style scoped lang="postcss">
.btn {
  @apply inline-flex items-center justify-center px-4 py-2 rounded-xl
         disabled:opacity-50 disabled:pointer-events-none;
}

/* solid — через токены */
.btn--solid {
  @apply text-accent-contrast bg-accent;
}

/* outline — как в макете (белая рамка) */
.btn--outline {
  @apply border rounded-md;
  border-color: #fff;
}
.btn--outline:hover {
  background: color-mix(in srgb, #fff 10%, transparent);
}
</style>
