<template>
  <NuxtLink v-if="showLink" :to="to" class="btn" :class="classes" v-bind="$attrs">
    <slot>{{ label }}</slot>
  </NuxtLink>

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
  { variant: 'outline', disabled: false },
)
const showLink = ref(!!props.to && !props.disabled)
const classes = computed(() => (props.variant === 'outline' ? 'btn--outline' : 'btn--solid'))
defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1;
}
.btn--outline {
  border: 1px solid var(--border-strong);
  background: transparent;
}
.btn--outline:hover {
  background: var(--overlay);
}
.btn--solid {
  color: var(--accent-contrast);
  background: var(--accent);
  border: 1px solid var(--accent);
}
</style>
