<template>
  <span>{{ text }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{ deadline: Date }>()
const emit = defineEmits(['end'])
const now = ref(Date.now())
let timer: any

const text = computed(() => {
  const left = Math.max(0, props.deadline.getTime() - now.value)
  const s = Math.floor(left / 1000)
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
})

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
    if (props.deadline.getTime() <= now.value) {
      clearInterval(timer)
      emit('end')
    }
  }, 1000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>
