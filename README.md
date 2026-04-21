# Apple Letters

`@delkon/apple-letters` is a Vue 3 handwritten text library built around a small engine-first core. The published package exposes a thin component layer, a composable, and the render-model engine used underneath.

## Install

```bash
pnpm add @delkon/apple-letters
```

`vue` is a peer dependency.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Letters } from '@delkon/apple-letters'

const progress = ref(0.4)
</script>

<template>
  <Letters text="hello" :progress="progress" color="currentColor" />
</template>
```

```ts
import { createLettersRenderModel, useLettersRender } from '@delkon/apple-letters'
```

## API

```ts
import { Letters, createLettersRenderModel, layoutText, useLettersRender } from '@delkon/apple-letters'
```

- `Letters`
Thin Vue SVG renderer for the engine output.

- `useLettersRender`
Vue composable that turns reactive input into a computed render model.

- `createLettersRenderModel`
Framework-agnostic render-model engine.

- `layoutText`
Lower-level text layout helper exported for advanced use.

## Project Structure

- `src`
Publishable library source.

- `demo`
Local Vite demo shell used during development.

- `target/letters`
Reference implementation kept for algorithm comparison during the rewrite.

## Development

```bash
pnpm install
pnpm dev
pnpm build
```

`pnpm dev` runs the local demo. `pnpm build` emits the publishable library bundles and type declarations into `dist/`.
