export interface ParsedLength {
  value: number
  unit: string
  mmValue: number
}

const MM_PER_INCH = 25.4
const MM_PER_PX = MM_PER_INCH / 96
const MM_PER_PT = MM_PER_INCH / 72
const MM_PER_PC = MM_PER_INCH / 6

export function parseSvgLength(raw: string | null | undefined): ParsedLength | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  const match = trimmed.match(/^([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*(mm|cm|in|pt|pc|px|%)?$/i)
  if (!match) return null

  const value = parseFloat(match[1])
  if (!Number.isFinite(value)) return null

  const unit = (match[2] ?? 'px').toLowerCase()
  let mmValue = value

  if (unit === 'mm') {
    mmValue = value
  } else if (unit === 'cm') {
    mmValue = value * 10
  } else if (unit === 'in') {
    mmValue = value * MM_PER_INCH
  } else if (unit === 'pt') {
    mmValue = value * MM_PER_PT
  } else if (unit === 'pc') {
    mmValue = value * MM_PER_PC
  } else if (unit === 'px') {
    mmValue = value * MM_PER_PX
  } else if (unit === '%') {
    return null
  }

  return { value, unit, mmValue }
}

export function convertMmToUnit(mm: number, targetUnit: 'mm' | 'cm' | 'in'): number {
  if (targetUnit === 'cm') return mm / 10
  if (targetUnit === 'in') return mm / MM_PER_INCH
  return mm
}
