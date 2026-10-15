import { useState } from 'react'
import { Link } from 'react-router'
import { Plus, ArrowLeft, Layers, FileUp, Sparkles, RefreshCw, X, AlertTriangle, CheckCircle2 } from 'lucide-react'
import logoImg from '../assets/logo.webp'

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false)
  const [demoState, setDemoState] = useState<'input' | 'analyzing' | 'report'>('input')
  const [jobText, setJobText] = useState(
    'Make 10 acrylic tags, 120 by 80 mm, using 3 mm clear acrylic. Cut the outside and engrave the name on the front.'
  )
  const [svgFileName] = useState('acrylic_tag_batch_v1.svg')

  const handleOpenJob = () => {
    setDemoState('input')
    setModalOpen(true)
  }

  const handleRunAudit = () => {
    setDemoState('analyzing')
    setTimeout(() => {
      setDemoState('report')
    }, 850)
  }

  const handleResetDemo = () => {
    setDemoState('input')
  }

  return (
    <div className="min-h-screen bg-[#f5ede4] text-[#111827] font-sans antialiased flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-[#e5dcd3] sticky top-0 z-30 px-6 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src={logoImg}
                alt="Tolerix"
                className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <span className="hidden sm:inline-block h-4 w-px bg-[#e5dcd3]" />
            <span className="hidden sm:inline-block text-xs font-mono font-medium text-[#78716c] bg-[#f5ede4] px-2.5 py-1 rounded-md">
              Workshop Workspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs sm:text-sm font-medium text-[#57534e] hover:text-[#09131e] flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <button
              onClick={handleOpenJob}
              className="rounded-full bg-[#071827] text-white text-xs sm:text-sm font-medium px-4 py-2 hover:bg-[#0d2a45] transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Job</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div className="bg-white/70 rounded-2xl p-5 border border-[#e5dcd3]">
            <p className="text-xs font-medium text-[#78716c] uppercase tracking-wider mb-1">Active Jobs</p>
            <p className="text-2xl font-semibold text-[#09131e]">0</p>
          </div>
          <div className="bg-white/70 rounded-2xl p-5 border border-[#e5dcd3]">
            <p className="text-xs font-medium text-[#78716c] uppercase tracking-wider mb-1">SVGs Inspected</p>
            <p className="text-2xl font-semibold text-[#09131e]">0</p>
          </div>
          <div className="bg-white/70 rounded-2xl p-5 border border-[#e5dcd3]">
            <p className="text-xs font-medium text-[#78716c] uppercase tracking-wider mb-1">Mismatches Caught</p>
            <p className="text-2xl font-semibold text-[#09131e]">0</p>
          </div>
          <div className="bg-white/70 rounded-2xl p-5 border border-[#e5dcd3]">
            <p className="text-xs font-medium text-[#78716c] uppercase tracking-wider mb-1">Machine Profiles</p>
            <p className="text-2xl font-semibold text-[#09131e]">1 Default</p>
          </div>
        </div>

        <div className="bg-white/80 rounded-3xl border border-[#e5dcd3] p-10 sm:p-16 text-center flex flex-col items-center justify-center min-h-[420px]">
          <div className="w-16 h-16 rounded-2xl bg-[#c28b55]/10 flex items-center justify-center text-[#b87d4b] mb-5">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium text-[#09131e] mb-3">
            No Manufacturing Jobs Yet
          </h2>
          <p className="text-sm sm:text-base text-[#57534e] max-w-md mb-8 leading-relaxed">
            Create your first preflight check to compare incoming customer order notes against the prepared production SVG drawing.
          </p>
          <button
            onClick={handleOpenJob}
            className="rounded-full bg-[#071827] text-white text-sm sm:text-base font-medium px-7 py-3 hover:bg-[#0d2a45] transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Job</span>
          </button>
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-[#09131e]/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#e5dcd3] overflow-hidden z-10 max-h-[90vh] flex flex-col">
            <div className="px-6 sm:px-8 py-5 border-b border-[#f0e8de] flex items-center justify-between bg-[#faf7f3]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#c28b55]/15 flex items-center justify-center text-[#b87d4b]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-medium text-[#09131e] text-base sm:text-lg">Tolerix Preflight Check</h3>
                  <p className="text-xs text-[#78716c]">Order-to-vector manufacturing audit</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#78716c] hover:text-[#09131e] p-1.5 rounded-full hover:bg-[#eee6dc] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              {demoState === 'input' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716c] mb-2">
                      Customer Instructions
                    </label>
                    <textarea
                      value={jobText}
                      onChange={(e) => setJobText(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-[#e2d7cb] p-3.5 text-sm text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#c28b55]/40 bg-[#faf7f4]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716c] mb-2">
                      Production File (SVG)
                    </label>
                    <div className="border-2 border-dashed border-[#e2d7cb] rounded-xl p-5 text-center bg-[#faf7f4] flex flex-col items-center justify-center">
                      <FileUp className="w-8 h-8 text-[#b87d4b] mb-2" />
                      <p className="text-sm font-medium text-[#1c1917]">{svgFileName}</p>
                      <p className="text-xs text-[#78716c] mt-0.5">Ready for deterministic bounds check</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#faf7f3] border border-[#eee4d9] p-4 text-xs space-y-1.5">
                    <p className="font-semibold text-[#44403c] uppercase tracking-wide">Extracted Target Fields</p>
                    <div className="grid grid-cols-2 gap-2 text-[#57534e]">
                      <div>Expected Qty: <span className="font-medium text-[#1c1917]">10</span></div>
                      <div>Expected Size: <span className="font-medium text-[#1c1917]">120 x 80 mm</span></div>
                      <div>Material: <span className="font-medium text-[#1c1917]">3 mm clear acrylic</span></div>
                      <div>Operations: <span className="font-medium text-[#1c1917]">Cut contour, Engrave</span></div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      onClick={() => setModalOpen(false)}
                      className="px-5 py-2.5 rounded-full text-sm font-medium text-[#57534e] hover:bg-[#f5ede4] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRunAudit}
                      className="px-6 py-2.5 rounded-full bg-[#071827] text-white text-sm font-medium hover:bg-[#0d2a45] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <span>Run Preflight Audit</span>
                    </button>
                  </div>
                </div>
              )}

              {demoState === 'analyzing' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-3 border-[#c28b55]/30 border-t-[#b87d4b] animate-spin" />
                  <p className="text-sm font-medium text-[#1c1917]">Measuring vector bounds and comparing order specifications...</p>
                  <p className="text-xs text-[#78716c]">Running deterministic geometry engine against SVG path tree</p>
                </div>
              )}

              {demoState === 'report' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#f0e8de]">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#b87d4b]">Audit Summary</span>
                      <h4 className="text-lg font-medium text-[#09131e]">2 Discrepancies Flagged</h4>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Requires Operator Approval
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-red-50/70 border border-red-200/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-red-900">Dimensional Mismatch (High Severity)</p>
                        <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">High</span>
                      </div>
                      <p className="text-xs text-red-800">
                        Order requested width: 120 mm. Measured geometry width in SVG: 100 mm. Discrepancy exceeds tolerance.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-amber-900">Missing Operation Layer (Medium Severity)</p>
                        <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Medium</span>
                      </div>
                      <p className="text-xs text-amber-800">
                        Requested engraving layer not distinguished by stroke color or layer name in uploaded SVG file.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-stone-800">Material Thickness Unverified</p>
                        <span className="text-xs font-semibold text-stone-600 bg-stone-200 px-2 py-0.5 rounded-full">Unverified</span>
                      </div>
                      <p className="text-xs text-stone-600">
                        Material (3 mm acrylic) cannot be inferred from vector contours. Verify machine stock before cutting.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <p className="text-xs text-emerald-800">
                        SVG structure valid: all outer paths closed, zero self-intersections or degenerate paths.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={handleResetDemo}
                      className="px-4 py-2 rounded-full text-xs font-medium text-[#57534e] hover:bg-[#f5ede4] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Test Another File</span>
                    </button>
                    <button
                      onClick={() => setModalOpen(false)}
                      className="px-6 py-2.5 rounded-full bg-[#071827] text-white text-sm font-medium hover:bg-[#0d2a45] transition-all cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
