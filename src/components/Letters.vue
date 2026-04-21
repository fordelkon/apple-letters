<script setup lang="ts">
import { computed } from 'vue'

import { useLettersRender } from '../composables/useLettersRender'
import { shouldRenderPath } from './renderVisibility'
import type { LettersInput } from '../core/types'

const props = withDefaults(defineProps<LettersInput>(), {
  progress: 1,
  strokeWidth: 2,
  color: 'currentColor',
  variant: 'simple',
  overlap: 0.02,
})

const model = useLettersRender(computed(() => props))
const visiblePaths = computed(() => model.value.paths.filter((item) => shouldRenderPath(item.strokeDashoffset)))
</script>

<template>
  <svg :viewBox="model.svg.viewBox" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
    <path
      v-for="item in visiblePaths"
      :key="item.key"
      :d="item.d"
      :stroke="item.stroke"
      :stroke-width="item.strokeWidth"
      :stroke-dasharray="item.strokeDasharray"
      :stroke-dashoffset="item.strokeDashoffset"
      :stroke-linecap="item.linecap"
      :stroke-linejoin="item.linejoin"
      pathLength="1"
      fill="none"
    />
    <circle
      v-for="item in model.dots"
      :key="item.key"
      :cx="item.translateX != null ? item.cx + item.translateX : item.cx"
      :cy="item.cy"
      :r="item.r"
      :fill="item.fill"
      :opacity="item.opacity"
    />
  </svg>
</template>
