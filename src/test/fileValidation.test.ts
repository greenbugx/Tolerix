import { describe, it, expect } from 'vitest'
import { validateDesignFile, computeSha256 } from '../lib/files/fileValidation'

describe('File Validation and Security', () => {
  it('validates a clean, well-formed SVG file', async () => {
    const cleanSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="120mm" height="80mm" viewBox="0 0 120 80">
      <rect x="10" y="10" width="100" height="60" rx="5" stroke="red" fill="none" />
    </svg>`
    const blob = new Blob([cleanSvg], { type: 'image/svg+xml' })

    const result = await validateDesignFile(blob, 'clean_tag.svg')
    expect(result.valid).toBe(true)
    expect(result.format).toBe('svg')
    expect(result.sha256).toHaveLength(64)
  })

  it('rejects SVGs containing executable script tags', async () => {
    const maliciousSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <script>alert("exploit")</script>
      <circle cx="50" cy="50" r="40" stroke="black" />
    </svg>`
    const blob = new Blob([maliciousSvg], { type: 'image/svg+xml' })

    const result = await validateDesignFile(blob, 'malicious.svg')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Unsafe active content')
  })

  it('rejects SVGs with inline javascript handlers', async () => {
    const maliciousSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" onload="alert(1)">
      <rect width="100" height="100" fill="red" />
    </svg>`
    const blob = new Blob([maliciousSvg], { type: 'image/svg+xml' })

    const result = await validateDesignFile(blob, 'handler.svg')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Unsafe active content')
  })

  it('rejects SVGs containing external entity declarations', async () => {
    const xxeSvg = `<!DOCTYPE svg [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <text>&xxe;</text>
    </svg>`
    const blob = new Blob([xxeSvg], { type: 'image/svg+xml' })

    const result = await validateDesignFile(blob, 'xxe.svg')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Unsafe active content')
  })

  it('computes repeatable SHA-256 digests', async () => {
    const content = '<svg>sample</svg>'
    const blob1 = new Blob([content], { type: 'image/svg+xml' })
    const blob2 = new Blob([content], { type: 'image/svg+xml' })

    const hash1 = await computeSha256(blob1)
    const hash2 = await computeSha256(blob2)
    expect(hash1).toBe(hash2)
  })
})
