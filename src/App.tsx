import { useState, useEffect } from 'react'
import Lenis from 'lenis'
import { ArrowRight, X, CheckCircle2, AlertTriangle, FileUp, Sparkles, RefreshCw } from 'lucide-react'
import heroImg from './assets/hero.webp'
import sec2Img from './assets/2.webp'
import sec3Img from './assets/3.webp'
import sec4Img from './assets/4.webp'
import logoImg from './assets/logo.webp'

export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [demoState, setDemoState] = useState<'input' | 'analyzing' | 'report'>('input')
  const [jobText, setJobText] = useState(
    'Make 10 acrylic tags, 120 by 80 mm, using 3 mm clear acrylic. Cut the outside and engrave the name on the front.'
  )
  const [svgFileName, setSvgFileName] = useState('acrylic_tag_batch_v1.svg')

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
    })

    const handleScroll = () => {
      setScrolled(window.scrollY > 24)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      lenis.destroy()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleOpenDemo = () => {
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
    setJobText(
      'Make 10 acrylic tags, 120 by 80 mm, using 3 mm clear acrylic. Cut the outside and engrave the name on the front.'
    )
    setSvgFileName('acrylic_tag_batch_v1.svg')
  }

  return (
    <div className="min-h-screen bg-[#f5ede4] text-[#111827] font-sans antialiased overflow-x-hidden selection:bg-[#c28b55]/20 selection:text-[#09131e]">
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#f5ede4]/90 backdrop-blur-md shadow-sm border-b border-[#e5dcd3]/60 h-20'
            : 'bg-transparent h-24'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-full flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group focus:outline-none">
            <img
              src={logoImg}
              alt="Tolerix"
              className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>
        </div>
      </header>

      <main>
        <section
          id="hero"
          className="relative min-h-[640px] sm:min-h-[720px] lg:min-h-[820px] flex items-center bg-cover bg-[position:85%_center] sm:bg-[position:80%_center] lg:bg-center bg-no-repeat pt-24"
          style={{ backgroundImage: `url(${heroImg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#f5ede4]/90 via-[#f5ede4]/60 via-45% to-transparent pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-24 w-full">
            <div className="max-w-xl lg:max-w-2xl">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.22em] text-[#b87d4b] uppercase mb-4 sm:mb-5">
                PRECISION BEFORE PRODUCTION
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#09131e] leading-[1.08] mb-6">
                Every cut
                <br />
                starts with
                <br />
                confidence.
              </h1>

              <p className="text-base sm:text-lg text-[#292524] max-w-md leading-relaxed mb-8 sm:mb-10 font-normal">
                Compare your customer's instructions with the design file, check dimensions, layers and manufacturing requirements, before the machine starts.
              </p>

              <div>
                <button
                  onClick={handleOpenDemo}
                  className="rounded-full bg-[#071827] text-white text-sm sm:text-base font-medium px-6 sm:px-7 py-3 hover:bg-[#0d2a45] transition-all duration-200 inline-flex items-center gap-2.5 shadow-sm hover:shadow active:scale-95 cursor-pointer"
                >
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="py-16 sm:py-24 lg:py-32 bg-[#f5ede4] overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
            <div className="w-full lg:w-1/2 px-6 sm:px-8 lg:px-0">
              <div className="rounded-2xl sm:rounded-3xl lg:rounded-l-none lg:rounded-r-[36px] overflow-hidden shadow-sm border border-[#e5dcd3] lg:border-l-0 bg-white/40">
                <img
                  src={sec2Img}
                  alt="Precision laser cut layered wood design"
                  className="w-full h-auto object-cover max-h-[440px] lg:max-h-[500px] transition-transform duration-700 hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="w-full lg:w-1/2 px-6 sm:px-8 lg:pr-16 lg:pl-6 max-w-xl">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.22em] text-[#b87d4b] uppercase mb-4 sm:mb-5">
                BUILT FOR REAL WORKSHOPS
              </p>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#09131e] leading-[1.12] mb-6">
                Save material.
                <br />
                Save time.
                <br />
                Deliver better work.
              </h2>

              <p className="text-base sm:text-lg text-[#57534e] max-w-md leading-relaxed">
                Tolerix helps you catch mismatches, wrong sizes and missing details early, so you can focus on what you do best, bringing designs to life.
              </p>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="relative min-h-[480px] sm:min-h-[540px] lg:min-h-[580px] flex items-center bg-[#18191a] bg-cover bg-right lg:bg-center bg-no-repeat py-20 sm:py-28"
          style={{ backgroundImage: `url(${sec3Img})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#18191a] via-[#18191a]/85 to-transparent pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
            <div className="max-w-xl lg:max-w-2xl">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.22em] text-[#c28b55] uppercase mb-4 sm:mb-5">
                DESIGNED FOR MAKERS
              </p>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-[1.12] mb-6">
                From custom tags
                <br />
                to complex designs.
              </h2>

              <p className="text-base sm:text-lg text-[#9ca3af] max-w-lg leading-relaxed">
                Whether you cut signs, prototypes, packaging or intricate art pieces, Tolerix gives you a simple way to verify files against real-world requirements.
              </p>
            </div>
          </div>
        </section>

        <section
          id="for-workshops"
          className="relative min-h-[420px] sm:min-h-[480px] flex items-center justify-center bg-cover bg-center bg-no-repeat py-24 sm:py-32"
          style={{ backgroundImage: `url(${sec4Img})` }}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.22em] text-[#b87d4b] uppercase mb-4 sm:mb-5">
              TURN IDEAS INTO FLAWLESS CUTS
            </p>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#09131e] mb-8 sm:mb-10">
              Make every cut count.
            </h2>

            <div>
              <button
                onClick={handleOpenDemo}
                className="rounded-full bg-[#071827] text-white text-sm sm:text-base font-medium px-7 sm:px-8 py-3.5 hover:bg-[#0d2a45] transition-all duration-200 inline-flex items-center gap-2.5 shadow-sm hover:shadow active:scale-95 cursor-pointer"
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#faf8f5] border-t border-[#e8dfd5]/80 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <a href="#" className="flex items-center gap-2 group focus:outline-none">
            <img
              src={logoImg}
              alt="Tolerix"
              className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>

          <div className="flex items-center gap-8 sm:gap-10">
            <button
              onClick={() => scrollTo('how-it-works')}
              className="text-sm font-medium text-[#4b5563] hover:text-[#09131e] transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={handleOpenDemo}
              className="text-sm font-medium text-[#4b5563] hover:text-[#09131e] transition-colors cursor-pointer"
            >
              Documentation
            </button>
            <button
              onClick={() => setPrivacyOpen(true)}
              className="text-sm font-medium text-[#4b5563] hover:text-[#09131e] transition-colors cursor-pointer"
            >
              Privacy
            </button>
          </div>
        </div>
      </footer>

      {privacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-[#09131e]/60 backdrop-blur-sm"
            onClick={() => setPrivacyOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#e5dcd3] overflow-hidden z-10 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e8de]">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-[#b87d4b]">Local-First Security</span>
                <h3 className="text-xl font-medium text-[#09131e]">Data Privacy Guarantee</h3>
              </div>
              <button
                onClick={() => setPrivacyOpen(false)}
                className="text-[#78716c] hover:text-[#09131e] p-1.5 rounded-full hover:bg-[#eee6dc] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[#57534e] leading-relaxed">
              Tolerix runs locally on your workstation. Uploaded production vector files, drawings, customer orders, and shop profiles are verified in-memory on your machine.
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPrivacyOpen(false)}
                className="px-6 py-2.5 rounded-full bg-[#071827] text-white text-sm font-medium hover:bg-[#0d2a45] transition-all cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

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
                className="text-[#78716c] hover:text-[#09131e] p-1.5 rounded-full hover:bg-[#eee6dc] transition-colors"
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
                      className="px-5 py-2.5 rounded-full text-sm font-medium text-[#57534e] hover:bg-[#f5ede4] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRunAudit}
                      className="px-6 py-2.5 rounded-full bg-[#071827] text-white text-sm font-medium hover:bg-[#0d2a45] transition-all flex items-center gap-2 shadow-sm"
                    >
                      <span>Run Preflight Audit</span>
                      <ArrowRight className="w-4 h-4" />
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
                      className="px-4 py-2 rounded-full text-xs font-medium text-[#57534e] hover:bg-[#f5ede4] transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Test Another File</span>
                    </button>
                    <button
                      onClick={() => setModalOpen(false)}
                      className="px-6 py-2.5 rounded-full bg-[#071827] text-white text-sm font-medium hover:bg-[#0d2a45] transition-all"
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
