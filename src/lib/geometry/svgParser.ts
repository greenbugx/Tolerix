import { SVGPathData } from 'svg-pathdata'
import { parseSvgLength } from './svgUnits'
import {
  IDENTITY_MATRIX,
  multiplyMatrices,
  applyMatrixToPoint,
  parseSvgTransform,
  type Matrix2D
} from './svgTransforms'

export interface ParsedPath {
  id: string
  d: string
  layerName: string
  stroke: string
  fill: string
  strokeWidth: number
  isClosed: boolean
  isZeroLength: boolean
  boundsMm: { minX: number; minY: number; maxX: number; maxY: number }
  pointsCount: number
}

export interface ParsedSvgDocument {
  declaredCanvasWidthMm: number | null
  declaredCanvasHeightMm: number | null
  viewBox: { minX: number; minY: number; width: number; height: number } | null
  viewBoxToMmScaleX: number
  viewBoxToMmScaleY: number
  paths: ParsedPath[]
  unsupportedElements: string[]
  hasExternalReferences: boolean
}

export function parseSvgContent(svgText: string): ParsedSvgDocument {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgText, 'image/svg+xml')
  const svgEl = doc.documentElement

  const rawWidth = svgEl.getAttribute('width')
  const rawHeight = svgEl.getAttribute('height')
  const parsedWidth = parseSvgLength(rawWidth)
  const parsedHeight = parseSvgLength(rawHeight)

  let viewBox: ParsedSvgDocument['viewBox'] = null
  const rawVb = svgEl.getAttribute('viewBox')
  if (rawVb) {
    const parts = rawVb
      .trim()
      .split(/[\s,]+/)
      .map(parseFloat)
      .filter(Number.isFinite)
    if (parts.length >= 4) {
      viewBox = { minX: parts[0], minY: parts[1], width: parts[2], height: parts[3] }
    }
  }

  let scaleX = 25.4 / 96
  let scaleY = 25.4 / 96

  if (parsedWidth && viewBox && viewBox.width > 0) {
    scaleX = parsedWidth.mmValue / viewBox.width
  } else if (parsedWidth) {
    scaleX = parsedWidth.unit === 'mm' ? 1 : parsedWidth.mmValue / parsedWidth.value
  }

  if (parsedHeight && viewBox && viewBox.height > 0) {
    scaleY = parsedHeight.mmValue / viewBox.height
  } else if (parsedHeight) {
    scaleY = parsedHeight.unit === 'mm' ? 1 : parsedHeight.mmValue / parsedHeight.value
  }

  const paths: ParsedPath[] = []
  const unsupportedElements: string[] = []

  function traverseNode(node: Element, parentMatrix: Matrix2D, parentLayerName: string) {
    const nodeTransform = parseSvgTransform(node.getAttribute('transform'))
    const currentMatrix = multiplyMatrices(parentMatrix, nodeTransform)

    const layerName =
      node.getAttribute('inkscape:label') ||
      node.getAttribute('data-name') ||
      node.getAttribute('id') ||
      parentLayerName

    const tagName = node.tagName.toLowerCase()

    if (tagName === 'g') {
      for (const child of Array.from(node.children)) {
        traverseNode(child, currentMatrix, layerName)
      }
      return
    }

    let d = ''
    if (tagName === 'path') {
      d = node.getAttribute('d') ?? ''
    } else if (tagName === 'rect') {
      const x = parseFloat(node.getAttribute('x') ?? '0') || 0
      const y = parseFloat(node.getAttribute('y') ?? '0') || 0
      const w = parseFloat(node.getAttribute('width') ?? '0') || 0
      const h = parseFloat(node.getAttribute('height') ?? '0') || 0
      const rx = parseFloat(node.getAttribute('rx') ?? '0') || 0
      const ry = parseFloat(node.getAttribute('ry') ?? '0') || rx
      if (rx > 0 || ry > 0) {
        d = `M ${x + rx} ${y} H ${x + w - rx} A ${rx} ${ry} 0 0 1 ${x + w} ${y + ry} V ${y + h - ry} A ${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h} H ${x + rx} A ${rx} ${ry} 0 0 1 ${x} ${y + h - ry} V ${y + ry} A ${rx} ${ry} 0 0 1 ${x + rx} ${y} Z`
      } else {
        d = `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`
      }
    } else if (tagName === 'circle') {
      const cx = parseFloat(node.getAttribute('cx') ?? '0') || 0
      const cy = parseFloat(node.getAttribute('cy') ?? '0') || 0
      const r = parseFloat(node.getAttribute('r') ?? '0') || 0
      d = `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`
    } else if (tagName === 'ellipse') {
      const cx = parseFloat(node.getAttribute('cx') ?? '0') || 0
      const cy = parseFloat(node.getAttribute('cy') ?? '0') || 0
      const rx = parseFloat(node.getAttribute('rx') ?? '0') || 0
      const ry = parseFloat(node.getAttribute('ry') ?? '0') || 0
      d = `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`
    } else if (tagName === 'line') {
      const x1 = parseFloat(node.getAttribute('x1') ?? '0') || 0
      const y1 = parseFloat(node.getAttribute('y1') ?? '0') || 0
      const x2 = parseFloat(node.getAttribute('x2') ?? '0') || 0
      const y2 = parseFloat(node.getAttribute('y2') ?? '0') || 0
      d = `M ${x1} ${y1} L ${x2} ${y2}`
    } else if (tagName === 'polygon' || tagName === 'polyline') {
      const rawPoints = (node.getAttribute('points') ?? '').trim().split(/[\s,]+/).map(parseFloat).filter(Number.isFinite)
      if (rawPoints.length >= 2) {
        d = `M ${rawPoints[0]} ${rawPoints[1]}`
        for (let i = 2; i < rawPoints.length; i += 2) {
          d += ` L ${rawPoints[i]} ${rawPoints[i + 1]}`
        }
        if (tagName === 'polygon') d += ' Z'
      }
    } else if (['defs', 'clippath', 'mask', 'style', 'title', 'desc', 'metadata'].includes(tagName)) {
      return
    } else {
      unsupportedElements.push(tagName)
      return
    }

    if (!d.trim()) return

    try {
      const pathData = new SVGPathData(d).toAbs()
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      let pointsCount = 0
      let isClosed = false
      let startPoint: { x: number; y: number } | null = null
      let lastPoint: { x: number; y: number } | null = null

      let curX = 0
      let curY = 0

      for (const cmd of pathData.commands) {
        if (cmd.type === SVGPathData.CLOSE_PATH) {
          isClosed = true
          continue
        }

        if ('x' in cmd && typeof cmd.x === 'number') {
          curX = cmd.x
        }
        if ('y' in cmd && typeof cmd.y === 'number') {
          curY = cmd.y
        }

        const transformed = applyMatrixToPoint(currentMatrix, curX, curY)
        const mmX = transformed.x * scaleX
        const mmY = transformed.y * scaleY

        if (startPoint === null) {
          startPoint = { x: mmX, y: mmY }
        }
        lastPoint = { x: mmX, y: mmY }

        minX = Math.min(minX, mmX)
        minY = Math.min(minY, mmY)
        maxX = Math.max(maxX, mmX)
        maxY = Math.max(maxY, mmY)
        pointsCount++
      }

      if (!isClosed && startPoint && lastPoint) {
        const dx = Math.abs(startPoint.x - lastPoint.x)
        const dy = Math.abs(startPoint.y - lastPoint.y)
        if (dx < 0.05 && dy < 0.05 && pointsCount > 2) {
          isClosed = true
        }
      }

      const isZeroLength = pointsCount <= 1 || (Math.abs(maxX - minX) < 0.001 && Math.abs(maxY - minY) < 0.001)

      paths.push({
        id: node.getAttribute('id') || `path-${paths.length + 1}`,
        d,
        layerName,
        stroke: node.getAttribute('stroke') || 'none',
        fill: node.getAttribute('fill') || 'none',
        strokeWidth: parseFloat(node.getAttribute('stroke-width') || '1') || 1,
        isClosed,
        isZeroLength,
        boundsMm: {
          minX: Number.isFinite(minX) ? minX : 0,
          minY: Number.isFinite(minY) ? minY : 0,
          maxX: Number.isFinite(maxX) ? maxX : 0,
          maxY: Number.isFinite(maxY) ? maxY : 0
        },
        pointsCount
      })
    } catch {
      unsupportedElements.push('complex-path-parse-failure')
    }
  }

  for (const child of Array.from(svgEl.children)) {
    traverseNode(child, IDENTITY_MATRIX, 'default')
  }

  return {
    declaredCanvasWidthMm: parsedWidth ? parsedWidth.mmValue : (viewBox ? viewBox.width * scaleX : null),
    declaredCanvasHeightMm: parsedHeight ? parsedHeight.mmValue : (viewBox ? viewBox.height * scaleY : null),
    viewBox,
    viewBoxToMmScaleX: scaleX,
    viewBoxToMmScaleY: scaleY,
    paths,
    unsupportedElements,
    hasExternalReferences: /xlink:href\s*=\s*["']https?:\/\//i.test(svgText)
  }
}
