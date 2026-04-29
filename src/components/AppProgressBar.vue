<template>
  <div :style="trackStyle">
    <div :style="fillStyle" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  pct: number
  height?: number
  dark?: boolean
}>(), { height: 8, dark: false })

const trackStyle = computed(() => ({
  width: '100%', height: props.height + 'px',
  background: props.dark ? 'rgba(255,255,255,0.15)' : '#E5E7EB',
  borderRadius: '999px', overflow: 'hidden',
}))

const fillStyle = computed(() => ({
  width: `${Math.max(0, Math.min(100, props.pct))}%`,
  height: '100%', background: '#22C55E', borderRadius: '999px',
  transition: 'width 600ms cubic-bezier(.2,.7,.2,1)',
}))
</script>
