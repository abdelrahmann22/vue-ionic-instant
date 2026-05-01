<template>
  <span :style="style">{{ status }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status: string }>()

const MAP: Record<string, { bg: string; fg: string }> = {
  Completed: { bg: '#D1FAE5', fg: '#166534' },
  Active:    { bg: '#D1FAE5', fg: '#166534' },
  Pending:   { bg: '#FEF3C7', fg: '#D97706' },
  Failed:    { bg: '#FEE2E2', fg: '#DC2626' },
  Expired:   { bg: '#F3F4F6', fg: '#6B7280' },
}

const style = computed(() => {
  const s = MAP[props.status] ?? MAP.Completed
  return {
    background: s.bg, color: s.fg,
    fontSize: '11px', fontWeight: '600',
    padding: '4px 10px', borderRadius: '9999px', lineHeight: '1.4',
    whiteSpace: 'nowrap', letterSpacing: '-0.005em', display: 'inline-block',
  }
})
</script>
