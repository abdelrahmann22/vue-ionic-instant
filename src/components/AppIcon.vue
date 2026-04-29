<template>
  <svg :style="svgStyle" :viewBox="viewBox" :width="size" :height="size">
    <template v-if="name === 'house'">
      <path v-bind="p" d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z"/>
    </template>
    <template v-else-if="name === 'scan-line'">
      <path v-bind="p" d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M3 12h18"/>
    </template>
    <template v-else-if="name === 'user'">
      <path v-bind="p" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle v-bind="p" cx="12" cy="7" r="4"/>
    </template>
    <template v-else-if="name === 'bell'">
      <path v-bind="p" d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path v-bind="p" d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </template>
    <template v-else-if="name === 'chevron-right'">
      <path v-bind="p" d="m9 18 6-6-6-6"/>
    </template>
    <template v-else-if="name === 'chevron-left'">
      <path v-bind="p" d="m15 18-6-6 6-6"/>
    </template>
    <template v-else-if="name === 'search'">
      <circle v-bind="p" cx="11" cy="11" r="8"/>
      <path v-bind="p" d="m21 21-4.3-4.3"/>
    </template>
    <template v-else-if="name === 'receipt'">
      <path v-bind="p" d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2Z"/>
      <path v-bind="p" d="M16 8H8M16 12H8M13 16H8"/>
    </template>
    <template v-else-if="name === 'arrow-left'">
      <path v-bind="p" d="M19 12H5M12 19l-7-7 7-7"/>
    </template>
    <template v-else-if="name === 'arrow-up-right'">
      <path v-bind="p" d="M7 17 17 7M7 7h10v10"/>
    </template>
    <template v-else-if="name === 'x'">
      <path v-bind="p" d="M18 6 6 18M6 6l12 12"/>
    </template>
    <template v-else-if="name === 'check'">
      <path v-bind="p" d="M20 6 9 17l-5-5"/>
    </template>
    <template v-else-if="name === 'clock'">
      <circle v-bind="p" cx="12" cy="12" r="10"/>
      <path v-bind="p" d="M12 6v6l4 2"/>
    </template>
    <template v-else-if="name === 'globe'">
      <circle v-bind="p" cx="12" cy="12" r="10"/>
      <path v-bind="p" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/>
    </template>
    <template v-else-if="name === 'log-out'">
      <path v-bind="p" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
    </template>
    <template v-else-if="name === 'delete'">
      <path v-bind="p" d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z"/>
      <path v-bind="p" d="m18 9-6 6M12 9l6 6"/>
    </template>
    <template v-else-if="name === 'plus'">
      <path v-bind="p" d="M12 5v14M5 12h14"/>
    </template>
    <template v-else-if="name === 'shield'">
      <path v-bind="p" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
    </template>
    <template v-else-if="name === 'credit-card'">
      <rect v-bind="p" x="2" y="5" width="20" height="14" rx="2"/>
      <path v-bind="p" d="M2 10h20"/>
    </template>
    <template v-else-if="name === 'flash'">
      <path v-bind="p" d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/>
    </template>
    <template v-else-if="name === 'image'">
      <rect v-bind="p" x="3" y="3" width="18" height="18" rx="2"/>
      <circle v-bind="p" cx="9" cy="9" r="2"/>
      <path v-bind="p" d="m21 15-5-5L5 21"/>
    </template>
    <template v-else-if="name === 'users'">
      <path v-bind="p" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle v-bind="p" cx="9" cy="7" r="4"/>
      <path v-bind="p" d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </template>
    <template v-else-if="name === 'utensils'">
      <path v-bind="p" d="M3 2v7c0 1.1.9 2 2 2h2v11M7 2v20M21 15V2c-2.21 0-4 1.79-4 4v8c0 .55.45 1 1 1h3Zm0 0v7"/>
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  size?: number
  color?: string
  strokeWidth?: number
}>(), {
  size: 24,
  color: 'currentColor',
  strokeWidth: 2,
})

const viewBox = '0 0 24 24'
const svgStyle = computed(() => ({
  display: 'inline-block',
  flexShrink: '0',
  verticalAlign: 'middle',
}))
const p = computed(() => ({
  fill: 'none',
  stroke: props.color,
  'stroke-width': props.strokeWidth,
  'stroke-linecap': 'round' as const,
  'stroke-linejoin': 'round' as const,
}))
</script>
