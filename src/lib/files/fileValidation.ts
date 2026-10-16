export interface FileValidationResult {
  valid: boolean
  format: 'svg' | 'dxf' | 'unsupported'
  sha256: string
  error?: string
  warnings: string[]
}

const MAX_FILE_SIZE = 50 * 1024 * 1024

const RAW_UNSAFE_PATTERNS = [
  /<script[\s>]/i,
  /<\/script>/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /data\s*:\s*text\/html/i,
  /\bon\w+\s*=/i,
  /<!ENTITY/i,
  /SYSTEM\s+["'][^"']+["']/i,
  /PUBLIC\s+["'][^"']+["']/i,
  /<foreignObject[\s>]/i,
  /<iframe[\s>]/i,
  /<object[\s>]/i,
  /<embed[\s>]/i,
  /<applet[\s>]/i,
  /<meta[\s>]/i,
  /<link[\s>]/i,
  /href\s*=\s*["']https?:\/\//i,
  /xlink:href\s*=\s*["']https?:\/\//i,
  /href\s*=\s*["']\/\//i,
  /xlink:href\s*=\s*["']\/\//i
]

const ALLOWED_ELEMENTS = new Set([
  'svg',
  'g',
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'text',
  'tspan',
  'defs',
  'clippath',
  'mask',
  'title',
  'desc',
  'metadata',
  'lineargradient',
  'radialgradient',
  'stop'
])

export async function readBlobAsText(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') {
    return blob.text()
  }
  if (typeof blob.arrayBuffer === 'function') {
    const buffer = await blob.arrayBuffer()
    return new TextDecoder().decode(buffer)
  }
  const { promise, resolve, reject } = Promise.withResolvers<string>()
  const reader = new FileReader()
  reader.onload = () => resolve((reader.result as string) || '')
  reader.onerror = () => reject(reader.error)
  reader.readAsText(blob)
  return promise
}
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
    const text = await readBlobAsText(file)

    for (const pattern of RAW_UNSAFE_PATTERNS) {
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

      const allElements = doc.querySelectorAll('*')
      for (const el of Array.from(allElements)) {
        const tagName = el.tagName.toLowerCase()
        if (!ALLOWED_ELEMENTS.has(tagName)) {
          return {
            valid: false,
            format: 'svg',
            sha256,
            error: `Disallowed SVG element <${tagName}> detected.`,
            warnings
          }
        }

        for (const attr of Array.from(el.attributes)) {
          const attrName = attr.name.toLowerCase()
          const attrValue = attr.value.trim().toLowerCase()

          if (attrName.startsWith('on')) {
            return {
              valid: false,
              format: 'svg',
              sha256,
              error: `Disallowed event handler attribute "${attr.name}".`,
              warnings
            }
          }

          if (
            attrValue.includes('javascript:') ||
            attrValue.includes('vbscript:') ||
            attrValue.includes('data:text/html')
          ) {
            return {
              valid: false,
              format: 'svg',
              sha256,
              error: `Disallowed script scheme in attribute "${attr.name}".`,
              warnings
            }
          }

          if (attrName === 'href' || attrName === 'xlink:href') {
            if (
              attrValue.startsWith('http:') ||
              attrValue.startsWith('https:') ||
              attrValue.startsWith('//') ||
              attrValue.startsWith('ftp:')
            ) {
              return {
                valid: false,
                format: 'svg',
                sha256,
                error: 'External network resource references are forbidden in manufacturing files.',
                warnings
              }
            }
          }
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
