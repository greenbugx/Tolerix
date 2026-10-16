export interface FileValidationResult {
  valid: boolean
  format: 'svg' | 'dxf' | 'unsupported'
  sha256: string
  error?: string
  warnings: string[]
}

const MAX_FILE_SIZE = 50 * 1024 * 1024

const UNSAFE_PATTERNS = [
  /<script[\s>]/i,
  /<\/script>/i,
  /javascript\s*:/i,
  /data\s*:\s*text\/html/i,
  /\bon\w+\s*=/i,
  /<!ENTITY/i,
  /SYSTEM\s+["'][^"']+["']/i,
  /<foreignObject[\s>]/i,
  /xlink:href\s*=\s*["']https?:\/\//i
]

export async function computeSha256(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  const bytes = new Uint8Array(digest)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function validateDesignFile(file: File | Blob, filename: string): Promise<FileValidationResult> {
  const warnings: string[] = []

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      format: 'unsupported',
      sha256: '',
      error: 'File exceeds the 50 MB workshop limit.',
      warnings
    }
  }

  const sha256 = await computeSha256(file)
  const lowerName = filename.toLowerCase()

  if (lowerName.endsWith('.svg')) {
    const text = await file.text()

    for (const pattern of UNSAFE_PATTERNS) {
      if (pattern.test(text)) {
        return {
          valid: false,
          format: 'svg',
          sha256,
          error: 'Unsafe active content or external reference detected in SVG.',
          warnings
        }
      }
    }

    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser()
      const doc = parser.parseFromString(text, 'image/svg+xml')
      const parserError = doc.querySelector('parsererror')
      if (parserError) {
        return {
          valid: false,
          format: 'svg',
          sha256,
          error: 'Malformed SVG XML structure.',
          warnings
        }
      }
      if (doc.documentElement.nodeName.toLowerCase() !== 'svg') {
        return {
          valid: false,
          format: 'svg',
          sha256,
          error: 'Root XML element is not <svg>.',
          warnings
        }
      }
    }

    return {
      valid: true,
      format: 'svg',
      sha256,
      warnings
    }
  }

  if (lowerName.endsWith('.dxf')) {
    warnings.push('DXF parsing supports basic contour inspection only.')
    return {
      valid: true,
      format: 'dxf',
      sha256,
      warnings
    }
  }

  return {
    valid: false,
    format: 'unsupported',
    sha256,
    error: 'Unsupported file format. Please upload an SVG or DXF file.',
    warnings
  }
}
