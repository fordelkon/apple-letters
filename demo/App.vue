<script setup lang="ts">
import { computed, ref } from 'vue'

import { Letters } from '@delkon/apple-letters'

const progress = ref(0.4)
const percentage = computed(() => `${Math.round(progress.value * 100)}%`)
</script>

<template>
  <main class="demo-shell">
    <section class="hero-panel">
      <p class="eyebrow">Vue letters engine</p>
      <h1>Handwritten paths, rendered from a small core engine.</h1>
      <p class="lede">
        The publishable library now lives under <code>src</code>, while this demo stays separate in
        <code>demo</code>.
      </p>
    </section>

    <section class="preview-panel">
      <div class="wordmark-frame">
        <Letters text="hello" :stroke-width="1" :progress="progress" color="currentColor" />
      </div>

      <label class="control-block" for="progress">
        <span>Progress</span>
        <strong>{{ percentage }}</strong>
      </label>
      <input
        id="progress"
        v-model.number="progress"
        class="progress-slider"
        type="range"
        min="0"
        max="1"
        step="0.01"
      />
    </section>
  </main>
</template>
