<template>
  <button :style="trackStyle" @click="$emit('update:modelValue', !modelValue)">
    <div :style="thumbStyle" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ modelValue: boolean }>()
defineEmits<{ 'update:modelValue': [val: boolean] }>()

const trackStyle = computed(() => ({
  width: '48px', height: '28px', borderRadius: '9999px',
  background: props.modelValue ? '#22C55E' : '#D1D5DB',
  border: 'none', position: 'relative', cursor: 'pointer',
  transition: 'background 180ms', padding: '0', flexShrink: '0',
}))

const thumbStyle = computed(() => ({
  position: 'absolute', top: '2px',
  left: props.modelValue ? '22px' : '2px',
  width: '24px', height: '24px', borderRadius: '50%', background: '#fff',
  transition: 'left 180ms cubic-bezier(.2,.7,.2,1)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
}))
</script>
