import type {
  Job,
  JobSpecification,
  DesignFile,
  MachineProfile,
  AuditRun,
  Finding
} from '../validation/schemas'

export interface FullAuditReportData {
  job: Job
  spec?: JobSpecification
  file?: DesignFile
  profile?: MachineProfile
  run?: AuditRun
  findings: Finding[]
}

export function escapeHtml(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function generateJsonReport(data: FullAuditReportData): string {
  return JSON.stringify(
    {
      application: 'Tolerix Manufacturing Preflight',
      exportedAt: new Date().toISOString(),
      job: data.job,
      specification: data.spec,
      fileMetadata: data.file
        ? {
            filename: data.file.filename,
            format: data.file.detectedFormat,
            fileSize: data.file.fileSize,
            sha256: data.file.sha256
          }
        : null,
      machineProfile: data.profile,
      auditRun: data.run,
      findings: data.findings
    },
    null,
    2
  )
}

export function generateHtmlReport(data: FullAuditReportData): string {
  const findingsRows = data.findings
    .map(
      (f) => `
    <tr style="border-bottom: 1px solid #e5dcd3;">
      <td style="padding: 10px; font-weight: 500;">${escapeHtml(f.title)}</td>
      <td style="padding: 10px; text-transform: uppercase; font-size: 11px; font-weight: 600; color: ${
        f.severity === 'high' ? '#b91c1c' : f.severity === 'medium' ? '#b45309' : '#047857'
      };">${escapeHtml(f.severity)}</td>
      <td style="padding: 10px;">${escapeHtml(f.expectedValue ?? '-')}</td>
      <td style="padding: 10px;">${escapeHtml(f.detectedValue ?? '-')}</td>
      <td style="padding: 10px; font-size: 12px; color: #57534e;">${escapeHtml(f.description)}</td>
    </tr>
  `
    )
    .join('')

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Tolerix Audit Report - ${escapeHtml(data.job.name)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #faf7f4; color: #111827; margin: 0; padding: 40px; }
    .card { background: #ffffff; border: 1px solid #e5dcd3; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    h1 { margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #09131e; }
    h2 { margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #09131e; border-bottom: 1px solid #f0e8de; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
    th { padding: 10px; border-bottom: 1px solid #e5dcd3; font-size: 11px; color: #78716c; text-transform: uppercase; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Tolerix Pre-Production Audit Report</h1>
    <p style="margin: 0; color: #78716c; font-size: 13px;">Generated on ${escapeHtml(new Date().toLocaleString())}</p>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 16px; font-size: 12px;">
      <div><strong>Job Name:</strong> ${escapeHtml(data.job.name)}</div>
      <div><strong>Customer:</strong> ${escapeHtml(data.job.customerName)}</div>
      <div><strong>Status:</strong> ${escapeHtml(data.job.status)}</div>
      <div><strong>Machine Profile:</strong> ${escapeHtml(data.profile?.name ?? 'Default')}</div>
    </div>
  </div>

  <div class="card">
    <h2>Audit Summary</h2>
    <div style="display: flex; gap: 24px; font-size: 14px;">
      <div>Issues: <strong>${escapeHtml(data.run?.issueCount ?? 0)}</strong></div>
      <div>Warnings: <strong>${escapeHtml(data.run?.warningCount ?? 0)}</strong></div>
      <div>Passed: <strong>${escapeHtml(data.run?.passedCount ?? 0)}</strong></div>
      <div>Unverified: <strong>${escapeHtml(data.run?.unverifiedCount ?? 0)}</strong></div>
    </div>
  </div>

  <div class="card">
    <h2>Findings and Verifications</h2>
    <table>
      <thead>
        <tr>
          <th>Rule Title</th>
          <th>Severity</th>
          <th>Expected</th>
          <th>Detected</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${findingsRows}
      </tbody>
    </table>
  </div>

  <p style="font-size: 11px; color: #78716c; text-align: center; margin-top: 32px;">
    Tolerix is an operator verification tool. This audit report is not a machine hardware safety certification.
  </p>
</body>
</html>`
}

export function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 15000)
}
