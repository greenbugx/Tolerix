import { describe, it, expect } from 'vitest'
import { parseSvgLength, convertMmToUnit } from '../lib/geometry/svgUnits'
import {
  IDENTITY_MATRIX,
  multiplyMatrices,
  applyMatrixToPoint,
  parseSvgTransform
} from '../lib/geometry/svgTransforms'
import { analyzeSvgGeometry } from '../lib/geometry/geometryAnalysis'

describe('SVG Geometry and Transformations', () => {
  it('correctly parses and converts SVG units to millimeters', () => {
    expect(parseSvgLength('120mm')?.mmValue).toBe(120)
    expect(parseSvgLength('8cm')?.mmValue).toBe(80)
    expect(parseSvgLength('2in')?.mmValue).toBeCloseTo(50.8, 1)
    expect(parseSvgLength('96px')?.mmValue).toBeCloseTo(25.4, 1)

    expect(convertMmToUnit(120, 'cm')).toBe(12)
    expect(convertMmToUnit(50.8, 'in')).toBeCloseTo(2, 2)
  })

  it('multiplies transform matrices and applies them accurately to coordinates', () => {
    const translateMatrix = parseSvgTransform('translate(20, 30)')
    const pt1 = applyMatrixToPoint(translateMatrix, 10, 10)
    expect(pt1.x).toBe(30)
    expect(pt1.y).toBe(40)

    const scaleMatrix = parseSvgTransform('scale(2, 3)')
    const combined = multiplyMatrices(translateMatrix, scaleMatrix)
    const pt2 = applyMatrixToPoint(combined, 10, 10)
    expect(pt2.x).toBe(40)
    expect(pt2.y).toBe(60)

    const identityPt = applyMatrixToPoint(IDENTITY_MATRIX, 5, 5)
    expect(identityPt.x).toBe(5)
    expect(identityPt.y).toBe(5)
  })

  it('measures actual visible geometry bounds and detects closed contours', () => {
    const svgWithKnownRect = `<svg xmlns="http://www.w3.org/2000/svg" width="120mm" height="80mm" viewBox="0 0 120 80">
      <rect x="10" y="10" width="100.2" height="60.1" rx="5" stroke="red" fill="none" />
      <circle cx="20" cy="40" r="5" stroke="red" fill="none" />
    </svg>`

    const analysis = analyzeSvgGeometry(svgWithKnownRect)
    expect(analysis.overallBoundsMm.widthMm).toBeCloseTo(100.2, 0.5)
    expect(analysis.overallBoundsMm.heightMm).toBeCloseTo(60.1, 0.5)
    expect(analysis.openCutPathsCount).toBe(0)
    expect(analysis.cutPathsCount).toBe(2)
  })

  it('calculates mathematically exact bounds for cubic and quadratic Bézier curves with extrema outside endpoints', () => {
    const cubicCurveSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="100mm" viewBox="0 0 100 100">
      <path d="M 0 0 C 25 100 75 100 100 0" stroke="red" fill="none" />
    </svg>`

    const analysisCubic = analyzeSvgGeometry(cubicCurveSvg)
    expect(analysisCubic.overallBoundsMm.widthMm).toBeCloseTo(100, 0.5)
    expect(analysisCubic.overallBoundsMm.heightMm).toBeCloseTo(75, 0.5)

    const quadCurveSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="100mm" viewBox="0 0 100 100">
      <path d="M 0 0 Q 50 100 100 0" stroke="red" fill="none" />
    </svg>`

    const analysisQuad = analyzeSvgGeometry(quadCurveSvg)
    expect(analysisQuad.overallBoundsMm.widthMm).toBeCloseTo(100, 0.5)
    expect(analysisQuad.overallBoundsMm.heightMm).toBeCloseTo(50, 0.5)
  })

  it('calculates mathematically exact bounds for elliptical arcs', () => {
    const arcSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="100mm" viewBox="0 0 100 100">
      <path d="M 0 0 A 50 50 0 0 0 100 0" stroke="red" fill="none" />
    </svg>`

    const analysis = analyzeSvgGeometry(arcSvg)
    expect(analysis.overallBoundsMm.widthMm).toBeCloseTo(100, 0.5)
    expect(analysis.overallBoundsMm.heightMm).toBeCloseTo(50, 0.5)
  })

  it('correctly maps non-zero viewBox origins into physical canvas space', () => {
    const offsetViewBoxSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="100mm" viewBox="-50 -50 100 100">
      <rect x="-50" y="-50" width="50" height="50" stroke="red" fill="none" />
    </svg>`

    const analysis = analyzeSvgGeometry(offsetViewBoxSvg)
    expect(analysis.overallBoundsMm.minX).toBeCloseTo(0, 0.5)
    expect(analysis.overallBoundsMm.minY).toBeCloseTo(0, 0.5)
    expect(analysis.overallBoundsMm.maxX).toBeCloseTo(50, 0.5)
    expect(analysis.overallBoundsMm.maxY).toBeCloseTo(50, 0.5)
    expect(analysis.overallBoundsMm.widthMm).toBeCloseTo(50, 0.5)
  })

  it('accumulates nested transforms with correct order and scale', () => {
    const nestedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="100mm" viewBox="0 0 100 100">
      <g transform="translate(10, 20)">
        <g transform="scale(2, 2)">
          <rect x="5" y="5" width="10" height="10" stroke="red" fill="none" />
        </g>
      </g>
    </svg>`

    const analysis = analyzeSvgGeometry(nestedSvg)
    expect(analysis.overallBoundsMm.minX).toBeCloseTo(20, 0.5)
    expect(analysis.overallBoundsMm.minY).toBeCloseTo(30, 0.5)
    expect(analysis.overallBoundsMm.maxX).toBeCloseTo(40, 0.5)
    expect(analysis.overallBoundsMm.maxY).toBeCloseTo(50, 0.5)
  })

  it('does not produce false duplicate detection for distinct shapes sharing bounding boxes', () => {
    const distinctShapesSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="100mm" viewBox="0 0 100 100">
      <polygon points="0,0 50,50 0,50" stroke="red" fill="none" />
      <polygon points="0,0 50,0 50,50" stroke="red" fill="none" />
    </svg>`

    const analysis = analyzeSvgGeometry(distinctShapesSvg)
    expect(analysis.duplicatePathsCount).toBe(0)

    const trueDuplicateSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="100mm" viewBox="0 0 100 100">
      <path d="M 0 0 L 50 0 L 50 50 Z" stroke="red" fill="none" />
      <path d="M 0 0 L 50 0 L 50 50 Z" stroke="red" fill="none" />
    </svg>`

    const analysisDup = analyzeSvgGeometry(trueDuplicateSvg)
    expect(analysisDup.duplicatePathsCount).toBe(1)
  })

  it('flags ambiguous layers and does not treat every unknown path as cut', () => {
    const ambiguousSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="100mm" viewBox="0 0 100 100">
      <path d="M 10 10 L 90 90" stroke="blue" fill="none" />
    </svg>`

    const analysis = analyzeSvgGeometry(ambiguousSvg)
    expect(analysis.ambiguousPathsCount).toBe(1)
    expect(analysis.cutPathsCount).toBe(0)
    expect(analysis.engravePathsCount).toBe(0)
  })

  it('distinguishes canvas size from actual shape bounds', () => {
    const svgWithMargin = `<svg xmlns="http://www.w3.org/2000/svg" width="200mm" height="200mm" viewBox="0 0 200 200">
      <rect x="50" y="50" width="50" height="50" stroke="red" fill="none" />
    </svg>`

    const analysis = analyzeSvgGeometry(svgWithMargin)
    expect(analysis.parsedDoc.declaredCanvasWidthMm).toBe(200)
    expect(analysis.overallBoundsMm.widthMm).toBeCloseTo(50, 0.5)
    expect(analysis.isCanvasMatchingBounds).toBe(false)
  })

  it('detects unclosed open cutting paths', () => {
    const svgWithOpenPath = `<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="100mm" viewBox="0 0 100 100">
      <path d="M 10 10 L 90 10 L 90 90 L 10 90" stroke="red" fill="none" />
    </svg>`

    const analysis = analyzeSvgGeometry(svgWithOpenPath)
    expect(analysis.openCutPathsCount).toBe(1)
  })
})
