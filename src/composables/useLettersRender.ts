import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { createLettersRenderModel } from '../core/render/createLettersRenderModel'
import type { LettersInput } from '../core/types'

export function useLettersRender(input: MaybeRefOrGetter<LettersInput>) {
  return computed(() => createLettersRenderModel(toValue(input)))
}
