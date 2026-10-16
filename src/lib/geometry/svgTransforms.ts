export type Matrix2D = [number, number, number, number, number, number]

export const IDENTITY_MATRIX: Matrix2D = [1, 0, 0, 1, 0, 0]

export function multiplyMatrices(m1: Matrix2D, m2: Matrix2D): Matrix2D {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
  ]
}

export function applyMatrixToPoint(m: Matrix2D, x: number, y: number): { x: number; y: number } {
  return {
    x: m[0] * x + m[2] * y + m[4],
    y: m[1] * x + m[3] * y + m[5]
  }
}

export function parseSvgTransform(raw: string | null | undefined): Matrix2D {
  if (!raw) return IDENTITY_MATRIX
  let currentMatrix: Matrix2D = [...IDENTITY_MATRIX]

  const regex = /([a-zA-Z]+)\s*\(([^)]+)\)/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(raw)) !== null) {
    const type = match[1].toLowerCase()
    const args = match[2]
      .trim()
      .split(/[\s,]+/)
      .map(parseFloat)
      .filter(Number.isFinite)

    let stepMatrix: Matrix2D = [...IDENTITY_MATRIX]

    if (type === 'matrix' && args.length >= 6) {
      stepMatrix = [args[0], args[1], args[2], args[3], args[4], args[5]]
    } else if (type === 'translate') {
      const tx = args[0] ?? 0
      const ty = args[1] ?? 0
      stepMatrix = [1, 0, 0, 1, tx, ty]
    } else if (type === 'scale') {
      const sx = args[0] ?? 1
      const sy = args[1] ?? sx
      stepMatrix = [sx, 0, 0, sy, 0, 0]
    } else if (type === 'rotate') {
      const angle = ((args[0] ?? 0) * Math.PI) / 180
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const cx = args[1] ?? 0
      const cy = args[2] ?? 0

      if (cx !== 0 || cy !== 0) {
        const toOrigin: Matrix2D = [1, 0, 0, 1, -cx, -cy]
        const rot: Matrix2D = [cos, sin, -sin, cos, 0, 0]
        const fromOrigin: Matrix2D = [1, 0, 0, 1, cx, cy]
        stepMatrix = multiplyMatrices(fromOrigin, multiplyMatrices(rot, toOrigin))
      } else {
        stepMatrix = [cos, sin, -sin, cos, 0, 0]
      }
    } else if (type === 'skewx') {
      const angle = ((args[0] ?? 0) * Math.PI) / 180
      stepMatrix = [1, 0, Math.tan(angle), 1, 0, 0]
    } else if (type === 'skewy') {
      const angle = ((args[0] ?? 0) * Math.PI) / 180
      stepMatrix = [1, Math.tan(angle), 0, 1, 0, 0]
    }

    currentMatrix = multiplyMatrices(currentMatrix, stepMatrix)
  }

  return currentMatrix
}
