<template>
  <button :style="style" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ active: boolean }>()
defineEmits<{ click: [] }>()

const style = computed(() => ({
  background: props.active ? '#1C1C1E' : '#FFFFFF',
  color: props.active ? '#fff' : '#6B7280',
  border: props.active ? 'none' : '1px solid #E5E7EB',
  borderRadius: '9999px', padding: '7px 14px',
  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
  letterSpacing: '-0.01em', whiteSpace: 'nowrap',
}))
</script>
