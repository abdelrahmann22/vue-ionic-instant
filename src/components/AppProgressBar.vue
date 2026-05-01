<template>
  <div :style="trackStyle">
    <div :style="greenFill" />
    <div :style="orangeFill" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  pct: number
  pendingPct?: number
  height?: number
  dark?: boolean
}>(), { pendingPct: 0, height: 8, dark: false })

const safePct = computed(() => Math.max(0, Math.min(100, props.pct)))
const safePending = computed(() => Math.max(0, Math.min(100 - safePct.value, props.pendingPct)))

const trackStyle = computed(() => ({
  width: '100%', height: props.height + 'px',
  background: props.dark ? 'rgba(255,255,255,0.15)' : '#E5E7EB',
  borderRadius: '999px', overflow: 'hidden',
  position: 'relative',
}))

const greenFill = computed(() => ({
  position: 'absolute', top: 0, left: 0,
  width: `${safePct.value}%`,
  height: '100%', background: '#22C55E', borderRadius: '999px',
  transition: 'width 600ms cubic-bezier(.2,.7,.2,1)',
}))

const orangeFill = computed(() => ({
  position: 'absolute', top: 0,
  left: `${safePct.value}%`,
  width: `${safePending.value}%`,
  height: '100%', background: '#F59E0B', borderRadius: '999px',
  transition: 'left 600ms cubic-bezier(.2,.7,.2,1), width 600ms cubic-bezier(.2,.7,.2,1)',
}))
</script>
