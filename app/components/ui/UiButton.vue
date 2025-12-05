<template>
  <!-- Ссылка -->
  <NuxtLink v-if="showLink" :to="to" class="btn" :class="btnClasses" v-bind="$attrs">
    <slot>{{ label }}</slot>
  </NuxtLink>

  <!-- Кнопка -->
  <button
    v-else
    class="btn"
    :class="btnClasses"
    :disabled="disabled"
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
    size?: 'sm' | 'md' | 'lg'
    block?: boolean
    disabled?: boolean
  }>(),
  {
    variant: 'outline',
    size: 'md', // 8-pt: sm=32, md=40, lg=48
    block: false,
    disabled: false,
  },
)

const showLink = computed(() => !!props.to && !props.disabled)

const btnClasses = computed(() => [
  props.variant === 'outline' ? 'btn--outline' : 'btn--solid',
  props.size === 'sm' ? 'btn--sm' : props.size === 'lg' ? 'btn--lg' : 'btn--md',
  props.block ? 'btn--block' : '',
])
defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
</script>

<style scoped lang="postcss">
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-inline: 12px;
  border-radius: 5px;
  border-width: 1px;
  font-weight: 400;
  letter-spacing: 0;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}
.btn--sm {
  height: 32px;
  font-size: 12px;
  padding-inline: 10px;
}
.btn--md {
  height: 40px;
  font-size: 14px;
  padding-inline: 12px;
}
.btn--lg {
  height: 48px;
  font-size: 16px;
  padding-inline: 16px;
}

.btn--outline {
  color: var(--fg);
  background: transparent;
  border-color: var(--border-strong);
}
.btn--outline:hover {
  background: var(--overlay);
}

.btn--solid {
  color: var(--accent-contrast);
  background: var(--accent);
  border-color: var(--accent);
}
</style>
