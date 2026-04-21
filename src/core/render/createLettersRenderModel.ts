import { getCustomLetter, type ResolvedPath } from '../fonts/custom-letters'
import { getLetterSlots, layoutText, type PathSegment } from '../layout/layoutText'
import type {
  LettersInput,
  LettersRenderModel,
} from '../types'
import { clampProgress } from './progress'

type RenderItem = {
  key: string
  kind: 'path' | 'dot'
  d: string
  strokeWidth: number
  startFrac: number
  endFrac: number
  reverse?: boolean
  tx?: number
  dot?: { cx: number; cy: number; r: number }
}

function estimatePathLength(d: string): number {
  const nums: number[] = []
  for (const match of d.matchAll(/-?\d+(?:\.\d+)?/g)) {
    nums.push(Number.parseFloat(match[0]))
  }

  let length = 0
  let prevX = nums[0] ?? 0
  let prevY = nums[1] ?? 0

  for (let index = 2; index < nums.length - 1; index += 2) {
    const x = nums[index]
    const y = nums[index + 1]
    const dx = x - prevX
    const dy = y - prevY
    length += Math.sqrt(dx * dx + dy * dy)
    prevX = x
    prevY = y
  }

  return length
}

function translatePathD(d: string, dx: number, dy: number): string {
  if (dx === 0 && dy === 0) return d

  const tokens = d.match(/[a-zA-Z]|[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g)
  if (!tokens) return d

  const result: string[] = []
  let command = ''
  let paramIndex = 0
  const absolutePairs: Record<string, number> = {
    M: 2,
    L: 2,
    T: 2,
    S: 4,
    Q: 4,
    C: 6,
  }

  for (const token of tokens) {
    if (/^[a-zA-Z]$/.test(token)) {
      command = token
      paramIndex = 0
      result.push(token)
      continue
    }

    const num = Number.parseFloat(token)
    const upper = command.toUpperCase()
    const isRelative = command === command.toLowerCase()

    if (isRelative) {
      result.push(token)
    } else if (upper === 'H') {
      result.push(String(Math.round((num + dx) * 10000) / 10000))
    } else if (upper === 'V') {
      result.push(String(Math.round((num + dy) * 10000) / 10000))
    } else if (upper === 'A') {
      const arcIndex = paramIndex % 7
      if (arcIndex === 5) result.push(String(Math.round((num + dx) * 10000) / 10000))
      else if (arcIndex === 6) result.push(String(Math.round((num + dy) * 10000) / 10000))
      else result.push(token)
    } else if (upper in absolutePairs) {
      const pairSize = absolutePairs[upper]
      const pairIndex = paramIndex % pairSize
      if (pairIndex % 2 === 0) result.push(String(Math.round((num + dx) * 10000) / 10000))
      else result.push(String(Math.round((num + dy) * 10000) / 10000))
    } else {
      result.push(token)
    }

    paramIndex++
  }

  return result.join(' ')
}

function computeRenderItems(
  segments: PathSegment[],
  slots: {
    char: string
    positionIndex: number
    offsetX: number
    left: number
  }[],
  customPositions: Set<number>,
  strokeWidth: number,
): RenderItem[] {
  const positionOrder: number[] = []
  const seen = new Set<number>()

  for (const segment of segments) {
    if (!seen.has(segment.positionIndex)) {
      positionOrder.push(segment.positionIndex)
      seen.add(segment.positionIndex)
    }
  }

  type PositionInfo = {
    posIdx: number
    isCustom: boolean
    hersheyLength: number
    segmentEntries: { seg: PathSegment; globalIdx: number }[]
    customPaths?: ResolvedPath[]
    customLengths?: number[]
    customTotalLength?: number
    slot?: (typeof slots)[0]
  }

  const positions: PositionInfo[] = []
  let globalWeightedLength = 0

  for (const posIdx of positionOrder) {
    const entries: { seg: PathSegment; globalIdx: number }[] = []
    let hersheyLength = 0

    for (let index = 0; index < segments.length; index++) {
      if (segments[index].positionIndex === posIdx) {
        entries.push({ seg: segments[index], globalIdx: index })
        hersheyLength += segments[index].approxLength
      }
    }

    const info: PositionInfo = {
      posIdx,
      isCustom: customPositions.has(posIdx),
      hersheyLength,
      segmentEntries: entries,
    }

    if (info.isCustom) {
      const slot = slots.find((item) => item.positionIndex === posIdx)
      info.slot = slot

      if (slot) {
        const resolved = getCustomLetter(slot.char, strokeWidth)
        if (resolved) {
          info.customPaths = resolved.paths
          info.customLengths = resolved.paths.map((path) => {
            if (path.dot) return 0.5
            if (path.drawWeight != null) return Math.max(path.drawWeight, 0.1)
            return Math.max(estimatePathLength(path.d), 0.5)
          })
          info.customTotalLength = info.customLengths.reduce((sum, value) => sum + value, 0)
        }
      }
    }

    globalWeightedLength += hersheyLength
    positions.push(info)
  }

  if (globalWeightedLength === 0) return []

  const items: RenderItem[] = []
  let cumulativeFraction = 0

  for (const position of positions) {
    const positionFraction = position.hersheyLength / globalWeightedLength

    if (
      position.isCustom &&
      position.customPaths &&
      position.customLengths &&
      position.customTotalLength &&
      position.slot
    ) {
      let innerFraction = 0

      for (let index = 0; index < position.customPaths.length; index++) {
        const path = position.customPaths[index]
        const pathLength = position.customLengths[index]
        const pathFraction = (pathLength / position.customTotalLength) * positionFraction

        items.push({
          key: `c-${position.posIdx}-${index}`,
          kind: path.dot ? 'dot' : 'path',
          d: path.d,
          strokeWidth: path.strokeWidth,
          startFrac: cumulativeFraction + innerFraction,
          endFrac: cumulativeFraction + innerFraction + pathFraction,
          reverse: path.reverse,
          tx: position.slot.offsetX + position.slot.left,
          dot: path.dot,
        })

        innerFraction += pathFraction
      }
    } else {
      let innerFraction = 0

      for (const { seg, globalIdx } of position.segmentEntries) {
        const segmentFraction =
          position.hersheyLength > 0
            ? (seg.approxLength / position.hersheyLength) * positionFraction
            : positionFraction

        items.push({
          key: `h-${globalIdx}`,
          kind: 'path',
          d: seg.d,
          strokeWidth,
          startFrac: cumulativeFraction + innerFraction,
          endFrac: cumulativeFraction + innerFraction + segmentFraction,
        })

        innerFraction += segmentFraction
      }
    }

    cumulativeFraction += positionFraction
  }

  return items
}

function computeItemOffsets(items: RenderItem[], progress: number, overlap: number): number[] {
  return items.map((item) => {
    const span = item.endFrac - item.startFrac
    const expandedSpan = span * (1 + overlap)
    const adjustedStart = item.startFrac * (1 - overlap)

    if (progress <= adjustedStart) return 1
    if (progress >= adjustedStart + expandedSpan) return 0

    const t = (progress - adjustedStart) / expandedSpan
    return 1 - t
  })
}

export function createLettersRenderModel(input: LettersInput): LettersRenderModel {
  const progress = clampProgress(input.progress)
  const strokeWidth = input.strokeWidth ?? 2
  const color = input.color ?? 'currentColor'
  const variant = input.variant ?? 'simple'
  const opts = input.opts ?? { tension: 4, curveMode: 'catmull-rom' }
  const overlap = input.overlap ?? 0.02

  const layout = layoutText(input.text, variant, opts)
  const slots = getLetterSlots(input.text, variant)

  const customPositions = new Set<number>()
  for (const slot of slots.slots) {
    if (getCustomLetter(slot.char)) customPositions.add(slot.positionIndex)
  }

  const renderItems = computeRenderItems(
    layout.segments,
    slots.slots,
    customPositions,
    strokeWidth,
  )
  const itemOffsets = computeItemOffsets(renderItems, progress, overlap)

  const paths: LettersRenderModel['paths'] = []
  const dots: LettersRenderModel['dots'] = []

  for (let index = 0; index < renderItems.length; index++) {
    const item = renderItems[index]
    const offset = itemOffsets[index]

    if (item.kind === 'dot' && item.dot) {
      const t = Math.max(0, Math.min(1, 1 - offset))
      const scale = t < 1 ? t * (2 - t) : 1

      dots.push({
        key: item.key,
        cx: item.dot.cx,
        cy: item.dot.cy,
        r: item.dot.r * scale,
        fill: color,
        opacity: scale,
        translateX: item.tx,
      })
      continue
    }

    const dashOffset = item.reverse ? -offset : offset
    const d = item.tx ? translatePathD(item.d, item.tx, 0) : item.d

    paths.push({
      key: item.key,
      d,
      stroke: color,
      strokeWidth: item.strokeWidth,
      strokeDasharray: 1,
      strokeDashoffset: dashOffset,
      linecap: 'round',
      linejoin: 'round',
    })
  }

  const pad = strokeWidth + 8

  return {
    svg: {
      viewBox: `${-pad} ${layout.minY - pad} ${layout.totalWidth + pad * 2} ${layout.maxY - layout.minY + pad * 2}`,
      width: layout.totalWidth,
      minY: layout.minY,
      maxY: layout.maxY,
    },
    paths,
    dots,
  }
}
