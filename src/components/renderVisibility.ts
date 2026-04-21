const HIDDEN_PATH_THRESHOLD = 0.02

export function shouldRenderPath(strokeDashoffset: number) {
  return Math.abs(strokeDashoffset) < 1 - HIDDEN_PATH_THRESHOLD
}
