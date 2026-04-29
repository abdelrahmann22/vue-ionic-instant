<template>
  <div :style="wrapStyle">{{ initial }}</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const PALETTES = [
  { bg: '#D1FAE5', text: '#166534' },
  { bg: '#FCE7F3', text: '#9D174D' },
  { bg: '#E9D5FF', text: '#6B21A8' },
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#DBEAFE', text: '#1E40AF' },
  { bg: '#FED7AA', text: '#9A3412' },
]

const props = withDefaults(defineProps<{
  initial: string
  size?: number
  palette?: number
}>(), { size: 40, palette: 0 })

const p = computed(() => PALETTES[props.palette % PALETTES.length])

const wrapStyle = computed(() => ({
  width: props.size + 'px',
  height: props.size + 'px',
  borderRadius: '50%',
  background: p.value.bg,
  color: p.value.text,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: Math.round(props.size * 0.36) + 'px',
  fontWeight: '700',
  flexShrink: '0',
  letterSpacing: '-0.01em',
}))
</script>
