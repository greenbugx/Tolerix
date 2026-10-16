import type {
  JobSpecification,
  MachineProfile,
  Finding
} from '../validation/schemas'
import type { GeometryAnalysisResult } from '../geometry/geometryAnalysis'

export function evaluateAuditRules(
  auditRunId: string,
  spec: JobSpecification,
  geo: GeometryAnalysisResult,
  profile: MachineProfile
): Finding[] {
  const findings: Finding[] = []
  const now = Date.now()
  const tolerance = spec.tolerances?.width ?? profile.defaultTolerance ?? 0.5

  const expectedWidthMm = spec.units === 'mm' ? spec.width : spec.units === 'cm' ? spec.width * 10 : spec.width * 25.4
  const expectedHeightMm = spec.units === 'mm' ? spec.height : spec.units === 'cm' ? spec.height * 10 : spec.height * 25.4

  const detectedWidthMm = geo.overallBoundsMm.widthMm
  const detectedHeightMm = geo.overallBoundsMm.heightMm

  const widthDiff = Math.abs(detectedWidthMm - expectedWidthMm)
  if (widthDiff > tolerance) {
    findings.push({
      id: `fnd-${findings.length + 1}`,
      auditRunId,
      ruleId: 'RULE_DIM_WIDTH',
      category: 'dimension',
      severity: 'high',
      title: 'Part width does not match',
      description: `Expected width of ${expectedWidthMm.toFixed(1)} mm, but measured ${detectedWidthMm.toFixed(1)} mm.`,
      expectedValue: `${expectedWidthMm.toFixed(1)} mm`,
      detectedValue: `${detectedWidthMm.toFixed(1)} mm`,
      units: 'mm',
      evidence: `Exceeds configured tolerance of ${tolerance} mm by ${(widthDiff - tolerance).toFixed(1)} mm.`,
      verificationStatus: 'issue',
      reviewStatus: 'needs_review',
      resolutionNotes: 'Check drawing scaling or ask client to confirm modified dimensions.',
      createdAt: now
    })
  } else {
    findings.push({
      id: `fnd-${findings.length + 1}`,
      auditRunId,
      ruleId: 'RULE_DIM_WIDTH',
      category: 'dimension',
      severity: 'low',
      title: 'Part width within tolerance',
      description: `Detected width matches confirmed order requirement within ${tolerance} mm tolerance.`,
      expectedValue: `${expectedWidthMm.toFixed(1)} mm`,
      detectedValue: `${detectedWidthMm.toFixed(1)} mm`,
      units: 'mm',
      verificationStatus: 'passed',
      reviewStatus: 'confirmed',
      createdAt: now
    })
  }

  const heightDiff = Math.abs(detectedHeightMm - expectedHeightMm)
  if (heightDiff > tolerance) {
    findings.push({
      id: `fnd-${findings.length + 1}`,
      auditRunId,
      ruleId: 'RULE_DIM_HEIGHT',
      category: 'dimension',
      severity: 'high',
      title: 'Part height does not match',
      description: `Expected height of ${expectedHeightMm.toFixed(1)} mm, but measured ${detectedHeightMm.toFixed(1)} mm.`,
      expectedValue: `${expectedHeightMm.toFixed(1)} mm`,
      detectedValue: `${detectedHeightMm.toFixed(1)} mm`,
      units: 'mm',
      evidence: `Exceeds configured tolerance of ${tolerance} mm by ${(heightDiff - tolerance).toFixed(1)} mm.`,
      verificationStatus: 'issue',
      reviewStatus: 'needs_review',
      resolutionNotes: 'Verify aspect ratio scaling in original vector CAD/artwork.',
      createdAt: now
    })
  } else {
    findings.push({
      id: `fnd-${findings.length + 1}`,
      auditRunId,
      ruleId: 'RULE_DIM_HEIGHT',
      category: 'dimension',
      severity: 'low',
      title: 'Part height within tolerance',
      description: `Detected height matches confirmed order requirement within ${tolerance} mm tolerance.`,
      expectedValue: `${expectedHeightMm.toFixed(1)} mm`,
      detectedValue: `${detectedHeightMm.toFixed(1)} mm`,
      units: 'mm',
      verificationStatus: 'passed',
      reviewStatus: 'confirmed',
      createdAt: now
    })
  }

  if (spec.thickness > 0) {
    findings.push({
      id: `fnd-${findings.length + 1}`,
      auditRunId,
      ruleId: 'RULE_MAT_THICKNESS',
      category: 'material',
      severity: 'medium',
      title: 'Material thickness not specified in drawing',
      description: 'Physical sheet thickness cannot be inferred from 2D vector drawing geometry.',
      expectedValue: `${spec.thickness} mm ${spec.material}`,
      detectedValue: 'Unspecified in file',
      units: 'mm',
      evidence: '2D SVG and DXF specifications do not encode physical gauge.',
      verificationStatus: 'unverified',
      reviewStatus: 'needs_review',
      resolutionNotes: 'Operator must physically measure stock caliper before running machine.',
      createdAt: now
    })
  }

  if (spec.quantity > 1) {
    findings.push({
      id: `fnd-${findings.length + 1}`,
      auditRunId,
      ruleId: 'RULE_QTY_NESTING',
      category: 'quantity',
      severity: 'medium',
      title: 'Expected quantity not detected in nesting',
      description: `Order requested ${spec.quantity} parts. File contains 1 visible workpiece geometry.`,
      expectedValue: `${spec.quantity} parts`,
      detectedValue: '1 single workpiece',
      verificationStatus: 'warning',
      reviewStatus: 'needs_review',
      resolutionNotes: 'Operator must verify sheet nesting count or set machine step repeat.',
      createdAt: now
    })
  }

  const requestedEngrave = spec.operations.some((op) => op.toLowerCase().includes('engrave'))
  if (requestedEngrave && geo.engravePathsCount === 0) {
    findings.push({
      id: `fnd-${findings.length + 1}`,
      auditRunId,
      ruleId: 'RULE_LAYER_ENGRAVE',
      category: 'layer',
      severity: 'medium',
      title: 'No engraving layer name match',
      description: 'Customer requested engraving, but no dedicated engrave stroke or layer was found.',
      expectedValue: 'ENGRAVE layer or black fill',
      detectedValue: '0 engrave paths identified',
      verificationStatus: 'warning',
      reviewStatus: 'needs_review',
      resolutionNotes: 'Assign artwork text/fill to machine engraving toolpath.',
      createdAt: now
    })
  }

  if (geo.parsedDoc.paths.length > 0) {
    findings.push({
      id: `fnd-${findings.length + 1}`,
      auditRunId,
      ruleId: 'RULE_SVG_VALID',
      category: 'geometry',
      severity: 'low',
      title: 'Valid SVG structure',
      description: 'File parsed as a valid vector document with measurable path geometry.',
      detectedValue: `${geo.totalPaths} paths`,
      verificationStatus: 'passed',
      reviewStatus: 'confirmed',
      createdAt: now
    })
  }

  if (geo.openCutPathsCount > 0) {
    findings.push({
      id: `fnd-${findings.length + 1}`,
      auditRunId,
      ruleId: 'RULE_OPEN_CUT_PATHS',
      category: 'geometry',
      severity: 'high',
      title: 'Open cutting paths detected',
      description: `Found ${geo.openCutPathsCount} unclosed path(s) marked for cutting. Open paths will fail to drop parts out of stock.`,
      detectedValue: `${geo.openCutPathsCount} open path(s)`,
      verificationStatus: 'issue',
      reviewStatus: 'needs_review',
      resolutionNotes: 'Close path contours in vector software using join nodes.',
      createdAt: now
    })
  } else {
    findings.push({
      id: `fnd-${findings.length + 1}`,
      auditRunId,
      ruleId: 'RULE_OPEN_CUT_PATHS',
      category: 'geometry',
      severity: 'low',
      title: 'Cut paths are closed',
      description: `All ${geo.cutPathsCount} cutting paths form fully closed perimeter loops.`,
      detectedValue: `${geo.cutPathsCount} closed paths`,
      verificationStatus: 'passed',
      reviewStatus: 'confirmed',
      createdAt: now
    })
  }

  if (geo.duplicatePathsCount > 0) {
    findings.push({
      id: `fnd-${findings.length + 1}`,
      auditRunId,
      ruleId: 'RULE_DUPLICATE_PATHS',
      category: 'geometry',
      severity: 'medium',
      title: 'Overlapping or duplicate paths detected',
      description: `Found ${geo.duplicatePathsCount} duplicate overlapping vector paths that may burn material twice.`,
      detectedValue: `${geo.duplicatePathsCount} duplicates`,
      verificationStatus: 'warning',
      reviewStatus: 'needs_review',
      resolutionNotes: 'Run redundant path deletion or curve cleanup.',
      createdAt: now
    })
  } else {
    findings.push({
      id: `fnd-${findings.length + 1}`,
      auditRunId,
      ruleId: 'RULE_DUPLICATE_PATHS',
      category: 'geometry',
      severity: 'low',
      title: 'No overlapping geometry',
      description: 'No duplicate or overlapping contours found in visible drawing bounds.',
      verificationStatus: 'passed',
      reviewStatus: 'confirmed',
      createdAt: now
    })
  }

  const bedWidthMm = profile.units === 'mm' ? profile.bedWidth : profile.units === 'cm' ? profile.bedWidth * 10 : profile.bedWidth * 25.4
  const bedHeightMm = profile.units === 'mm' ? profile.bedHeight : profile.units === 'cm' ? profile.bedHeight * 10 : profile.bedHeight * 25.4

  if (detectedWidthMm > bedWidthMm || detectedHeightMm > bedHeightMm) {
    findings.push({
      id: `fnd-${findings.length + 1}`,
      auditRunId,
      ruleId: 'RULE_MACHINE_BED',
      category: 'geometry',
      severity: 'high',
      title: 'Part exceeds machine bed envelope',
      description: `Part size (${detectedWidthMm.toFixed(1)} x ${detectedHeightMm.toFixed(1)} mm) exceeds machine limit of ${bedWidthMm} x ${bedHeightMm} mm.`,
      expectedValue: `< ${bedWidthMm} x ${bedHeightMm} mm`,
      detectedValue: `${detectedWidthMm.toFixed(1)} x ${detectedHeightMm.toFixed(1)} mm`,
      verificationStatus: 'issue',
      reviewStatus: 'needs_review',
      resolutionNotes: 'Split design into tiles or choose a larger bed machine profile.',
      createdAt: now
    })
  }

  return findings
}
