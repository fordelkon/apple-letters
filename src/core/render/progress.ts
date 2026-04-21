export function clampProgress(progress: number | undefined): number {
  const value = progress ?? 1
  return Math.min(Math.max(value, 0), 1)
}
