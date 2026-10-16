import { describe, it, expect } from 'vitest'
import { generateJsonReport, generateHtmlReport, escapeHtml } from '../lib/reports/reportService'
import type { FullAuditReportData } from '../lib/reports/reportService'

describe('Report Generation', () => {
  const sampleData: FullAuditReportData = {
    job: {
      id: 'job-rep-1',
      name: 'Custom Tag Batch',
      customerName: 'Maple Studio',
      originalInstructions: '10 tags',
      workflowStage: 'review',
      status: 'ready',
      selectedModelId: 'gemma-4b',
      selectedMachineProfileId: 'prof-1',
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    profile: {
      id: 'prof-1',
      name: 'Thunder Laser Nova 35',
      machineType: 'CO2 Laser',
      bedWidth: 900,
      bedHeight: 600,
      units: 'mm',
      supportedFormats: ['svg'],
      supportedMaterials: ['acrylic'],
      minThickness: 0.5,
      maxThickness: 10,
      minFeatureSize: 0.8,
      kerf: 0.15,
      allowedOperations: ['cut', 'engrave'],
      defaultTolerance: 0.5,
      isDefault: true,
      createdAt: Date.now()
    },
    run: {
      id: 'run-rep-1',
      jobId: 'job-rep-1',
      sourceFileDigest: 'sha256fake',
      specificationVersion: 1,
      machineProfileVersion: 'prof-1',
      startedAt: Date.now() - 1000,
      completedAt: Date.now(),
      ruleEngineVersion: '1.0.0',
      status: 'completed',
      issueCount: 1,
      warningCount: 1,
      passedCount: 4,
      unverifiedCount: 1
    },
    findings: [
      {
        id: 'fnd-1',
        auditRunId: 'run-rep-1',
        ruleId: 'RULE_DIM_WIDTH',
        category: 'dimension',
        severity: 'high',
        title: 'Width mismatch',
        description: 'Expected 120 mm, found 100 mm',
        verificationStatus: 'issue',
        reviewStatus: 'needs_review',
        createdAt: Date.now()
      }
    ]
  }

  it('generates valid structured JSON report', () => {
    const jsonStr = generateJsonReport(sampleData)
    const parsed = JSON.parse(jsonStr)

    expect(parsed.application).toContain('Tolerix')
    expect(parsed.job.name).toBe('Custom Tag Batch')
    expect(parsed.findings).toHaveLength(1)
    expect(parsed.findings[0].title).toBe('Width mismatch')
  })

  it('generates clean, offline-ready HTML report', () => {
    const htmlStr = generateHtmlReport(sampleData)

    expect(htmlStr).toContain('<!doctype html>')
    expect(htmlStr).toContain('Custom Tag Batch')
    expect(htmlStr).toContain('Width mismatch')
    expect(htmlStr).toContain('Thunder Laser Nova 35')
  })

  it('strictly escapes HTML in all user and audit fields to prevent injection', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
    expect(escapeHtml('Tom & Jerry "Special"')).toBe('Tom &amp; Jerry &quot;Special&quot;')

    const maliciousData: FullAuditReportData = {
      ...sampleData,
      job: {
        ...sampleData.job,
        name: '<script>alert("hacked")</script>',
        customerName: '<img src=x onerror=alert(1)>'
      },
      findings: [
        {
          id: 'fnd-xss',
          auditRunId: 'run-rep-1',
          ruleId: 'RULE_XSS',
          category: 'dimension',
          severity: 'high',
          title: '<b onmouseover="alert(1)">Evil Title</b>',
          description: '<iframe src="javascript:alert(1)"></iframe>',
          verificationStatus: 'issue',
          reviewStatus: 'needs_review',
          createdAt: Date.now()
        }
      ]
    }

    const html = generateHtmlReport(maliciousData)
    expect(html).not.toContain('<script>alert("hacked")</script>')
    expect(html).toContain('&lt;script&gt;alert(&quot;hacked&quot;)&lt;/script&gt;')
    expect(html).not.toContain('<img src=x')
    expect(html).toContain('&lt;img src=x')
    expect(html).not.toContain('<iframe src=')
    expect(html).toContain('&lt;iframe')
  })
})
