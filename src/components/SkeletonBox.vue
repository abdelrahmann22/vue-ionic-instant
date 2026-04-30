<template>
  <div class="skeleton-box" :style="boxStyle" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  width?: string | number
  height?: string | number
  radius?: string | number
  inline?: boolean
}>(), {
  width: '100%',
  height: 14,
  radius: 6,
  inline: false,
})

function size(v: string | number): string {
  return typeof v === 'number' ? `${v}px` : v
}

const boxStyle = computed(() => ({
  width: size(props.width),
  height: size(props.height),
  borderRadius: size(props.radius),
  display: props.inline ? 'inline-block' : 'block',
}))
</script>

<style scoped>
.skeleton-box {
  background: linear-gradient(
    90deg,
    #ECEFF3 0%,
    #F5F7FA 50%,
    #ECEFF3 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
