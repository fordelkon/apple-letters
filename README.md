# Apple Letters

`@delkon/apple-letters` is a Vue 3 handwritten text library built around a small engine-first core.

It gives you two layers:

- a thin `Letters` Vue component for direct rendering
- a lower-level engine API for custom SVG or animation workflows

## Install

```bash
pnpm add @delkon/apple-letters
```

`vue` is a peer dependency.

## Quick Start

```vue
<script setup lang="ts">
import { Letters } from '@delkon/apple-letters'
</script>

<template>
  <Letters text="hello" color="#1f2937" />
</template>
```

## Common Usage

### Control draw progress

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { Letters } from '@delkon/apple-letters'

const progress = ref(0.4)
const percentage = computed(() => `${Math.round(progress.value * 100)}%`)
</script>

<template>
  <Letters text="hello" :progress="progress" color="currentColor" />
  <input v-model.number="progress" type="range" min="0" max="1" step="0.01" />
  <span>{{ percentage }}</span>
</template>
```

### Tune stroke style

```vue
<script setup lang="ts">
import { Letters } from '@delkon/apple-letters'
</script>

<template>
  <Letters
    text="bonjour"
    color="#b45309"
    :stroke-width="2.4"
    variant="simple"
    :overlap="0.04"
  />
</template>
```

### Use the composable in your own component

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLettersRender } from '@delkon/apple-letters'

const progress = ref(0.65)

const model = useLettersRender(
  computed(() => ({
    text: 'engine',
    progress: progress.value,
    color: '#111827',
    strokeWidth: 2,
  })),
)
</script>

<template>
  <svg :viewBox="model.svg.viewBox" fill="none">
    <path
      v-for="item in model.paths"
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
```

### Use the engine directly

```ts
import { createLettersRenderModel } from '@delkon/apple-letters'

const model = createLettersRenderModel({
  text: 'hello',
  progress: 0.5,
  color: '#2563eb',
  strokeWidth: 2,
})

console.log(model.svg.viewBox)
console.log(model.paths)
console.log(model.dots)
```

## API

```ts
import {
  Letters,
  createLettersRenderModel,
  layoutText,
  useLettersRender,
} from '@delkon/apple-letters'
```

### `Letters`

The default Vue component for rendering handwritten SVG paths.

Supported props:

- `text: string`
- `progress?: number`
- `strokeWidth?: number`
- `color?: string`
- `variant?: 'simple' | 'complex'`
- `overlap?: number`
- `opts?: SmoothingOptions`

### `useLettersRender`

Turns reactive input into a computed render model. Useful when you want full control over SVG rendering while staying inside Vue reactivity.

### `createLettersRenderModel`

Framework-agnostic engine entry. Returns:

- `svg`
- `paths`
- `dots`

This is the best choice when you want to build your own renderer or feed the geometry into another animation system.

### `layoutText`

Lower-level layout helper for advanced use cases. Most consumers will not need it directly.

## Notes

- `progress` is expected to be between `0` and `1`
- `variant="simple"` is the default
- `color` defaults to `currentColor`
- `strokeWidth` defaults to `2`
- `overlap` defaults to `0.02`

## Development

```bash
pnpm install
pnpm dev
pnpm build
```

- `pnpm dev` runs the local demo
- `pnpm build` emits the publishable library bundles and type declarations into `dist/`

## Reference

Inspired by `@kumailnanji/letters`:
https://github.com/kumailnanji/letters
