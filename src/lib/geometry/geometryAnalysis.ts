import { parseSvgContent, type ParsedPath, type ParsedSvgDocument } from './svgParser'

export interface GeometryAnalysisResult {
  parsedDoc: ParsedSvgDocument
  overallBoundsMm: {
    minX: number
    minY: number
    maxX: number
    maxY: number
    widthMm: number
    heightMm: number
  }
  totalPaths: number
  cutPathsCount: number
  engravePathsCount: number
  ambiguousPathsCount: number
  openCutPathsCount: number
  zeroLengthPathsCount: number
  duplicatePathsCount: number
  layers: string[]
  isCanvasMatchingBounds: boolean
}

export type PathOperationKind = 'cut' | 'engrave' | 'ambiguous'

export function classifyPathOperation(path: ParsedPath): PathOperationKind {
  const layer = path.layerName.toLowerCase()
  const stroke = path.stroke.toLowerCase()
  const fill = path.fill.toLowerCase()

  const hasCutLayer =
    layer.includes('cut') ||
    layer.includes('outside') ||
    layer.includes('contour') ||
    layer.includes('through')
  const hasCutStroke =
    stroke === 'red' ||
    stroke === '#f00' ||
    stroke === '#ff0000' ||
    stroke.includes('239, 68, 68') ||
    stroke.includes('255, 0, 0')

  const hasEngraveLayer =
    layer.includes('engrave') ||
    layer.includes('etch') ||
    layer.includes('score') ||
    layer.includes('text') ||
    layer.includes('raster')
  const hasEngraveFill = fill !== 'none' && fill !== 'transparent' && fill !== ''
  const hasEngraveStroke =
    stroke === 'black' ||
    stroke === '#000' ||
    stroke === '#000000' ||
    stroke.includes('30, 41, 59') ||
    stroke.includes('0, 0, 0')

  if (hasCutLayer || (hasCutStroke && !hasEngraveFill)) {
    return 'cut'
  }

  if (hasEngraveLayer || hasEngraveFill || (hasEngraveStroke && !hasCutStroke)) {
    return 'engrave'
  }

  return 'ambiguous'
}

function arePathsDuplicate(p1: ParsedPath, p2: ParsedPath): boolean {
  const dx1 = Math.abs(p1.boundsMm.minX - p2.boundsMm.minX)
  const dy1 = Math.abs(p1.boundsMm.minY - p2.boundsMm.minY)
  const dx2 = Math.abs(p1.boundsMm.maxX - p2.boundsMm.maxX)
  const dy2 = Math.abs(p1.boundsMm.maxY - p2.boundsMm.maxY)

  if (dx1 > 0.05 || dy1 > 0.05 || dx2 > 0.05 || dy2 > 0.05) {
    return false
  }

  const n = p1.normalizedPoints.length
  if (n === 0 || n !== p2.normalizedPoints.length) {
    return false
  }

  let matchForward = true
  for (let i = 0; i < n; i++) {
    const pt1 = p1.normalizedPoints[i]
    const pt2 = p2.normalizedPoints[i]
    if (Math.abs(pt1.x - pt2.x) > 0.05 || Math.abs(pt1.y - pt2.y) > 0.05) {
      matchForward = false
      break
    }
  }

  if (matchForward) return true

  let matchReverse = true
  for (let i = 0; i < n; i++) {
    const pt1 = p1.normalizedPoints[i]
    const pt2 = p2.normalizedPoints[n - 1 - i]
    if (Math.abs(pt1.x - pt2.x) > 0.05 || Math.abs(pt1.y - pt2.y) > 0.05) {
      matchReverse = false
      break
    }
  }

  return matchReverse
}

export function analyzeSvgGeometry(svgText: string): GeometryAnalysisResult {
  const parsedDoc = parseSvgContent(svgText)
  const paths = parsedDoc.paths

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  let cutCount = 0
  let engraveCount = 0
  let ambiguousCount = 0
  let openCutCount = 0
  let zeroLengthCount = 0
  const layerSet = new Set<string>()

  for (const path of paths) {
    layerSet.add(path.layerName)

    if (path.isZeroLength) {
      zeroLengthCount++
      continue
    }

    minX = Math.min(minX, path.boundsMm.minX)
    minY = Math.min(minY, path.boundsMm.minY)
    maxX = Math.max(maxX, path.boundsMm.maxX)
    maxY = Math.max(maxY, path.boundsMm.maxY)

    const opKind = classifyPathOperation(path)
    if (opKind === 'cut') {
      cutCount++
      if (!path.isClosed) {
        openCutCount++
      }
    } else if (opKind === 'engrave') {
      engraveCount++
    } else {
      ambiguousCount++
    }
  }

  let duplicateCount = 0
  for (let i = 0; i < paths.length; i++) {
    for (let j = i + 1; j < paths.length; j++) {
      if (arePathsDuplicate(paths[i], paths[j])) {
        duplicateCount++
      }
    }
  }

  const validBounds = Number.isFinite(minX) && Number.isFinite(maxX)
  const widthMm = validBounds ? Math.max(0, maxX - minX) : 0
  const heightMm = validBounds ? Math.max(0, maxY - minY) : 0

  let isCanvasMatchingBounds = false
  if (parsedDoc.declaredCanvasWidthMm && parsedDoc.declaredCanvasHeightMm && validBounds) {
    const dw = Math.abs(parsedDoc.declaredCanvasWidthMm - widthMm)
    const dh = Math.abs(parsedDoc.declaredCanvasHeightMm - heightMm)
    isCanvasMatchingBounds = dw < 1.0 && dh < 1.0
  }

  return {
    parsedDoc,
    overallBoundsMm: {
      minX: validBounds ? minX : 0,
      minY: validBounds ? minY : 0,
      maxX: validBounds ? maxX : 0,
      maxY: validBounds ? maxY : 0,
      widthMm,
      heightMm
    },
    totalPaths: paths.length,
    cutPathsCount: cutCount,
    engravePathsCount: engraveCount,
    ambiguousPathsCount: ambiguousCount,
    openCutPathsCount: openCutCount,
    zeroLengthPathsCount: zeroLengthCount,
    duplicatePathsCount: duplicateCount,
    layers: Array.from(layerSet),
    isCanvasMatchingBounds
  }
}
