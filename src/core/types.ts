export type FontVariant = 'simple' | 'complex'

export type CurveMode = 'catmull-rom' | 'fit-curve'

export interface SmoothingOptions {
  tension?: number
  chaikinIterations?: number
  chaikinRatio?: number
  resampleInterval?: number
  gaussianSigma?: number
  gaussianPasses?: number
  curveMode?: CurveMode
  fitError?: number
}

export interface LettersInput {
  text: string
  progress?: number
  strokeWidth?: number
  color?: string
  variant?: FontVariant
  opts?: SmoothingOptions
  overlap?: number
}

export interface RenderPathModel {
  key: string
  d: string
  stroke: string
  strokeWidth: number
  strokeDasharray: number
  strokeDashoffset: number
  linecap: 'round'
  linejoin: 'round'
  translateX?: number
}

export interface RenderDotModel {
  key: string
  cx: number
  cy: number
  r: number
  fill: string
  opacity: number
  translateX?: number
}

export interface LettersRenderModel {
  svg: {
    viewBox: string
    width: number
    minY: number
    maxY: number
  }
  paths: RenderPathModel[]
  dots: RenderDotModel[]
}
