import { describe, it, expect } from 'vitest'
import { evaluateAuditRules } from '../lib/audit/rules'
import { analyzeSvgGeometry } from '../lib/geometry/geometryAnalysis'
import type { JobSpecification, MachineProfile } from '../lib/validation/schemas'

describe('Deterministic Audit Rules', () => {
  const sampleProfile: MachineProfile = {
    id: 'prof-test',
    name: 'Laser 60W',
    machineType: 'CO2 Laser',
    bedWidth: 600,
    bedHeight: 400,
    units: 'mm',
    supportedFormats: ['svg'],
    supportedMaterials: ['acrylic', 'plywood'],
    minThickness: 0.5,
    maxThickness: 10,
    minFeatureSize: 0.8,
    kerf: 0.15,
    allowedOperations: ['cut', 'engrave'],
    defaultTolerance: 0.5,
    isDefault: true,
    createdAt: Date.now()
  }

  const sampleSpec: JobSpecification = {
    id: 'spec-test',
    jobId: 'job-test',
    quantity: 10,
    width: 120,
    height: 80,
    units: 'mm',
    material: 'acrylic',
    thickness: 3,
    operations: ['cut', 'engrave'],
    expectedCutLayers: ['cut'],
    expectedEngraveLayers: ['engrave'],
    tolerances: { width: 0.5, height: 0.5 },
    fieldStates: {},
    sourceExcerpts: {},
    updatedAt: Date.now()
  }

  it('detects dimensional mismatch between order requirements and file bounds', () => {
    const mismatchedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="60mm" viewBox="0 0 100 60">
      <rect x="0" y="0" width="100.2" height="60.1" rx="5" stroke="red" fill="none" />
    </svg>`

    const geo = analyzeSvgGeometry(mismatchedSvg)
    const findings = evaluateAuditRules('audit-1', sampleSpec, geo, sampleProfile)

    const widthFinding = findings.find((f) => f.ruleId === 'RULE_DIM_WIDTH')
    expect(widthFinding?.severity).toBe('high')
    expect(widthFinding?.verificationStatus).toBe('issue')

    const heightFinding = findings.find((f) => f.ruleId === 'RULE_DIM_HEIGHT')
    expect(heightFinding?.severity).toBe('high')
    expect(heightFinding?.verificationStatus).toBe('issue')

    const thicknessFinding = findings.find((f) => f.ruleId === 'RULE_MAT_THICKNESS')
    expect(thicknessFinding?.verificationStatus).toBe('unverified')

    const nestingFinding = findings.find((f) => f.ruleId === 'RULE_QTY_NESTING')
    expect(nestingFinding?.verificationStatus).toBe('warning')
  })

  it('passes when dimensions match within tolerance', () => {
    const matchingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="120mm" height="80mm" viewBox="0 0 120 80">
      <rect x="0" y="0" width="120.2" height="80.1" rx="5" stroke="red" fill="none" />
    </svg>`

    const geo = analyzeSvgGeometry(matchingSvg)
    const findings = evaluateAuditRules('audit-2', sampleSpec, geo, sampleProfile)

    const widthFinding = findings.find((f) => f.ruleId === 'RULE_DIM_WIDTH')
    expect(widthFinding?.verificationStatus).toBe('passed')

    const heightFinding = findings.find((f) => f.ruleId === 'RULE_DIM_HEIGHT')
    expect(heightFinding?.verificationStatus).toBe('passed')
  })

  it('flags parts that exceed machine bed limits', () => {
    const hugeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="700mm" height="500mm" viewBox="0 0 700 500">
      <rect x="0" y="0" width="700" height="500" stroke="red" fill="none" />
    </svg>`

    const geo = analyzeSvgGeometry(hugeSvg)
    const findings = evaluateAuditRules('audit-3', sampleSpec, geo, sampleProfile)

    const bedFinding = findings.find((f) => f.ruleId === 'RULE_MACHINE_BED')
    expect(bedFinding?.severity).toBe('high')
    expect(bedFinding?.verificationStatus).toBe('issue')
  })
})
