import { describe, it, expect } from 'vitest'
import {
  extractRequirementsHeuristic,
  cleanJsonText
} from '../lib/ai/extraction'
import { ExtractedRequirementSchema } from '../lib/validation/schemas'

describe('Requirements Extraction and Normalization', () => {
  it('correctly parses informal customer instructions into structured fields', () => {
    const message =
      'Please make 10 acrylic tags, 120 by 80 mm, using 3 mm clear acrylic. Cut the outside and engrave the name on the front.'

    const extracted = extractRequirementsHeuristic(message)
    expect(extracted.quantity).toBe(10)
    expect(extracted.width).toBe(120)
    expect(extracted.height).toBe(80)
    expect(extracted.units).toBe('mm')
    expect(extracted.material).toBe('acrylic')
    expect(extracted.thickness).toBe(3)
    expect(extracted.operations).toContain('cut')
    expect(extracted.operations).toContain('engrave')
    expect(extracted.missingFields.length).toBe(0)
    expect(extracted.sourceExcerpts.quantity).toBeTruthy()
    expect(extracted.sourceExcerpts.dimensions).toBeTruthy()
  })

  it('tracks missing fields when instructions omit them', () => {
    const incompleteMessage = 'Cut some wooden stars 50 by 50 mm.'
    const extracted = extractRequirementsHeuristic(incompleteMessage)

    expect(extracted.width).toBe(50)
    expect(extracted.height).toBe(50)
    expect(extracted.material).toBe('wood')
    expect(extracted.thickness).toBeNull()
    expect(extracted.quantity).toBeNull()
    expect(extracted.missingFields).toContain('quantity')
    expect(extracted.missingFields).toContain('thickness')
  })

  it('strips Markdown code fences and parses strict Zod schema', () => {
    const rawAiOutput = '```json\n{\n  "quantity": 5,\n  "width": 100,\n  "height": 50,\n  "units": "mm",\n  "material": "plywood",\n  "thickness": 4,\n  "operations": ["cut"],\n  "expectedCutLayers": ["cut"],\n  "expectedEngraveLayers": [],\n  "constraints": [],\n  "missingFields": [],\n  "ambiguousFields": [],\n  "sourceExcerpts": {}\n}\n```'

    const cleaned = cleanJsonText(rawAiOutput)
    const parsed = JSON.parse(cleaned)
    const validated = ExtractedRequirementSchema.parse(parsed)

    expect(validated.quantity).toBe(5)
    expect(validated.material).toBe('plywood')
    expect(validated.thickness).toBe(4)
  })
})
