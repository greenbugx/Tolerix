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
  openCutPathsCount: number
  zeroLengthPathsCount: number
  duplicatePathsCount: number
  layers: string[]
  isCanvasMatchingBounds: boolean
}

function isCutPath(path: ParsedPath): boolean {
  const layer = path.layerName.toLowerCase()
  const stroke = path.stroke.toLowerCase()
  if (layer.includes('cut') || layer.includes('outside') || layer.includes('contour')) {
    return true
  }
  if (stroke === 'red' || stroke === '#f00' || stroke === '#ff0000' || stroke.includes('239, 68, 68')) {
    return true
  }
  return false
}

function isEngravePath(path: ParsedPath): boolean {
  const layer = path.layerName.toLowerCase()
  const stroke = path.stroke.toLowerCase()
  const fill = path.fill.toLowerCase()
  if (layer.includes('engrave') || layer.includes('etch') || layer.includes('text')) {
    return true
  }
  if (fill !== 'none' || stroke === 'black' || stroke === '#000' || stroke === '#000000' || stroke.includes('30, 41, 59')) {
    return true
  }
  return false
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

    const isCut = isCutPath(path)
    const isEngrave = isEngravePath(path)

    if (isCut) {
      cutCount++
      if (!path.isClosed) {
        openCutCount++
      }
    } else if (isEngrave) {
      engraveCount++
    } else {
      cutCount++
      if (!path.isClosed) {
        openCutCount++
      }
    }
  }

  let duplicateCount = 0
  for (let i = 0; i < paths.length; i++) {
    for (let j = i + 1; j < paths.length; j++) {
      const p1 = paths[i]
      const p2 = paths[j]
      const dx1 = Math.abs(p1.boundsMm.minX - p2.boundsMm.minX)
      const dy1 = Math.abs(p1.boundsMm.minY - p2.boundsMm.minY)
      const dx2 = Math.abs(p1.boundsMm.maxX - p2.boundsMm.maxX)
      const dy2 = Math.abs(p1.boundsMm.maxY - p2.boundsMm.maxY)

      if (dx1 < 0.05 && dy1 < 0.05 && dx2 < 0.05 && dy2 < 0.05 && p1.pointsCount === p2.pointsCount) {
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
    openCutPathsCount: openCutCount,
    zeroLengthPathsCount: zeroLengthCount,
    duplicatePathsCount: duplicateCount,
    layers: Array.from(layerSet),
    isCanvasMatchingBounds
  }
}
