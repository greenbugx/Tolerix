import { ExtractedRequirementSchema, type ExtractedRequirement } from '../validation/schemas'
import type { LocalTextModel } from './provider'

export const EXTRACTION_SYSTEM_PROMPT = `You are a manufacturing preflight assistant for laser-cutting and custom fabrication workshops.
Your sole job is to parse informal customer instructions into structured requirement fields.
Never calculate geometry, coordinates, path bounds, or verify file safety.
Distinguish explicitly stated values from unprovided values. If an attribute is not provided, list it in missingFields and set its value to null.
Respond ONLY with a single JSON object matching this exact structure:
{
  "quantity": number or null,
  "width": number or null,
  "height": number or null,
  "units": "mm" or "cm" or "in" or null,
  "material": string or null,
  "thickness": number or null,
  "operations": string[],
  "expectedCutLayers": string[],
  "expectedEngraveLayers": string[],
  "constraints": string[],
  "missingFields": string[],
  "ambiguousFields": string[],
  "sourceExcerpts": { [key: string]: string }
}`

export function cleanJsonText(raw: string): string {
  let cleaned = raw.trim()
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3)
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3)
  }
  return cleaned.trim()
}

export function extractRequirementsHeuristic(text: string): ExtractedRequirement {
  const lower = text.toLowerCase()

  let quantity: number | null = null
  const qtyMatch = text.match(/(?:make|cut|produce|quantity|qty|order|pieces?|tags?|count)\s*(?:of|:)?\s*(\d+)/i) ?? text.match(/(\d+)\s*(?:pieces?|tags?|items?|units?|sets?|coasters?)/i)
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1], 10)
  }

  let width: number | null = null
  let height: number | null = null
  let units: 'mm' | 'cm' | 'in' | null = null

  const dimMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:x|by|×)\s*(\d+(?:\.\d+)?)\s*(mm|cm|in|inch|inches)?/i)
  if (dimMatch) {
    width = parseFloat(dimMatch[1])
    height = parseFloat(dimMatch[2])
    const rawUnit = (dimMatch[3] ?? '').toLowerCase()
    if (rawUnit === 'cm') units = 'cm'
    else if (rawUnit.startsWith('in')) units = 'in'
    else units = 'mm'
  }

  let thickness: number | null = null
  const thickMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:mm|cm|in)?\s*(?:thick|thickness)/i) ?? text.match(/using\s*(\d+(?:\.\d+)?)\s*mm/i) ?? text.match(/(\d+(?:\.\d+)?)\s*mm\s*(?:clear\s*)?(?:acrylic|wood|plywood|mdf)/i)
  if (thickMatch) {
    thickness = parseFloat(thickMatch[1])
  }

  let material: string | null = null
  if (lower.includes('acrylic')) material = 'acrylic'
  else if (lower.includes('plywood')) material = 'plywood'
  else if (lower.includes('wood')) material = 'wood'
  else if (lower.includes('mdf')) material = 'mdf'
  else if (lower.includes('leather')) material = 'leather'

  const operations: string[] = []
  if (lower.includes('cut')) operations.push('cut')
  if (lower.includes('engrave') || lower.includes('etch')) operations.push('engrave')
  if (lower.includes('score')) operations.push('score')

  const missingFields: string[] = []
  if (quantity === null) missingFields.push('quantity')
  if (width === null || height === null) missingFields.push('dimensions')
  if (material === null) missingFields.push('material')
  if (thickness === null) missingFields.push('thickness')

  const sourceExcerpts: Record<string, string> = {}
  if (qtyMatch) sourceExcerpts.quantity = qtyMatch[0]
  if (dimMatch) sourceExcerpts.dimensions = dimMatch[0]
  if (thickMatch) sourceExcerpts.thickness = thickMatch[0]
  if (material) sourceExcerpts.material = material

  return {
    quantity,
    width,
    height,
    units: units ?? (width !== null ? 'mm' : null),
    material,
    thickness,
    operations: operations.length > 0 ? operations : ['cut'],
    expectedCutLayers: ['cut', 'outside'],
    expectedEngraveLayers: ['engrave', 'text'],
    constraints: [],
    missingFields,
    ambiguousFields: [],
    sourceExcerpts
  }
}

export async function extractRequirementsWithModel(
  text: string,
  model: LocalTextModel,
  signal?: AbortSignal
): Promise<ExtractedRequirement> {
  const userPrompt = `Customer message:\n"""\n${text}\n"""\n\nReturn strict JSON now:`
  const rawResponse = await model.generate({
    systemPrompt: EXTRACTION_SYSTEM_PROMPT,
    userPrompt,
    signal
  })

  const cleaned = cleanJsonText(rawResponse)
  const parsed = JSON.parse(cleaned)
  return ExtractedRequirementSchema.parse(parsed)
}
