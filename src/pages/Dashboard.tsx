import { useState } from 'react'
import { Link } from 'react-router'
import {
  Home,
  FileText,
  Cpu,
  BarChart2,
  Settings,
  Bell,
  ChevronDown,
  ArrowLeft,
  Plus,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Menu,
  X,
  FileUp,
  Sparkles,
  RefreshCw,
  Check,
  RotateCcw,
  Trash2,
  Info,
  ChevronRight,
  UploadCloud,
  Send,
  Maximize2,
  Edit3,
  Copy,
  ZoomIn,
  ZoomOut,
  Share2,
  FileDown
} from 'lucide-react'
import logoImg from '../assets/logo.webp'
import dash1Img from '../assets/dash1.webp'
import h2Img from '../assets/h2.webp'
import h3Img from '../assets/h3.webp'
import h4Img from '../assets/h4.webp'
import sec2Img from '../assets/2.webp'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [isCreatingJob, setIsCreatingJob] = useState(false)
  const [createStep, setCreateStep] = useState<1 | 2 | 3 | 4>(1)
  const [manualFieldsOpen, setManualFieldsOpen] = useState(false)
  const [canvasTab, setCanvasTab] = useState<'Preview' | 'Layers' | 'Paths' | 'Dimensions'>('Preview')
  const [activeGalleryImg, setActiveGalleryImg] = useState(dash1Img)
  const [reviewConfirmed, setReviewConfirmed] = useState(true)
  const [selectedModel, setSelectedModel] = useState<'Gemma 4B' | 'Gemma 2B'>('Gemma 4B')
  const [modelMenuOpen, setModelMenuOpen] = useState(false)
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('flower_panel.dxf')
  const [modalOpen, setModalOpen] = useState(false)
  const [demoState, setDemoState] = useState<'input' | 'analyzing' | 'report'>('input')
  const [copiedSha, setCopiedSha] = useState(false)
  const [jobText, setJobText] = useState(
    'Please make 10 acrylic tags, 120 by 80 mm, using 3 mm clear acrylic. Cut the outside and engrave the name on the front.'
  )

  const initialJobs = [
    {
      id: 'job-1',
      name: 'Acrylic Tags - Batch 01',
      customer: 'Maple Studio',
      status: 'Needs Review',
      statusType: 'review',
      updated: '2 minutes ago',
      thumb: h2Img
    },
    {
      id: 'job-2',
      name: 'Coaster Set - Custom Pattern',
      customer: 'Lumen Crafts',
      status: 'Ready',
      statusType: 'ready',
      updated: '1 hour ago',
      thumb: dash1Img
    },
    {
      id: 'job-3',
      name: 'Ornament - Logo Cut',
      customer: 'Pine & Pixel',
      status: 'In Progress',
      statusType: 'progress',
      updated: '3 hours ago',
      thumb: sec2Img
    }
  ]

  const [jobsList, setJobsList] = useState(initialJobs)

  const navItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'Jobs', icon: FileText },
    { name: 'Machine Profiles', icon: Cpu },
    { name: 'Reports', icon: BarChart2 },
    { name: 'Settings', icon: Settings }
  ]

  const stats = [
    {
      num: '28',
      label: 'Total Jobs',
      badge: '↑ +12%',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: FileText,
      iconColor: 'text-[#b87d4b] bg-[#c28b55]/15'
    },
    {
      num: '18',
      label: 'Ready for Production',
      badge: null,
      badgeColor: '',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 bg-emerald-50'
    },
    {
      num: '6',
      label: 'Need Review',
      badge: null,
      badgeColor: '',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 bg-amber-50'
    },
    {
      num: '4',
      label: 'In Progress',
      badge: null,
      badgeColor: '',
      icon: Clock,
      iconColor: 'text-[#6b7280] bg-stone-100'
    }
  ]

  const handleStartNewJobFlow = () => {
    setActiveTab('Jobs')
    setIsCreatingJob(true)
    setCreateStep(1)
  }

  const handleOpenJob = () => {
    setDemoState('input')
    setModalOpen(true)
  }

  const handleOpenExample = () => {
    setDemoState('report')
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

  const handleCopySha = () => {
    setCopiedSha(true)
    setTimeout(() => setCopiedSha(false), 2000)
  }

  const handleFinishNewJob = () => {
    const newEntry = {
      id: `job-${Date.now()}`,
      name: 'Custom Name Tag - Production',
      customer: 'Maple & Co.',
      status: 'Ready',
      statusType: 'ready',
      updated: 'Just now',
      thumb: dash1Img
    }
    setJobsList([newEntry, ...jobsList])
    setIsCreatingJob(false)
    setCreateStep(1)
  }

  return (
    <div className="min-h-screen w-full bg-[#f5ede4] text-[#111827] font-sans antialiased flex flex-col md:flex-row">
      <aside className="hidden md:flex w-72 shrink-0 bg-[#161a22] text-[#9ca3af] flex-col justify-between p-6 border-r border-[#222732] h-screen sticky top-0 z-20">
        <div className="space-y-8">
          <div className="pt-2 pb-1">
            <Link to="/" className="inline-flex items-center gap-2 group focus:outline-none">
              <img
                src={logoImg}
                alt="Tolerix"
                className="h-8 w-auto brightness-0 invert object-contain transition-transform group-hover:scale-105"
              />
            </Link>
          </div>

          <nav className="space-y-2.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.name
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name)
                    if (item.name !== 'Jobs') {
                      setIsCreatingJob(false)
                    }
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#242b37] text-white shadow-md'
                      : 'text-[#9ca3af] hover:text-white hover:bg-[#1c222c]'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="pt-5 border-t border-[#222732] relative">
          {modelMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setModelMenuOpen(false)}
              />
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1c222c] border border-[#2b3340] rounded-2xl p-1.5 shadow-xl z-30 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#717b8c]">
                  Select Model Runtime
                </div>
                <button
                  onClick={() => {
                    setSelectedModel('Gemma 4B')
                    setModelMenuOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    selectedModel === 'Gemma 4B'
                      ? 'bg-[#28313f] text-white'
                      : 'text-[#9ca3af] hover:text-white hover:bg-[#232a36]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span>Gemma 4B</span>
                  </div>
                  {selectedModel === 'Gemma 4B' && (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedModel('Gemma 2B')
                    setModelMenuOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    selectedModel === 'Gemma 2B'
                      ? 'bg-[#28313f] text-white'
                      : 'text-[#9ca3af] hover:text-white hover:bg-[#232a36]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span>Gemma 2B</span>
                  </div>
                  {selectedModel === 'Gemma 2B' && (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </button>
              </div>
            </>
          )}

          <button
            onClick={() => setModelMenuOpen(!modelMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#1c222c] border border-[#2b3340] text-xs font-medium text-white/90 hover:border-[#3d485a] hover:bg-[#202733] transition-all cursor-pointer shadow-sm relative z-10"
          >
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="font-medium text-sm">{selectedModel}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[#717b8c] transition-transform duration-200 ${
                modelMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 bg-[#161a22] text-[#9ca3af] flex flex-col justify-between p-6 z-10 h-full">
            <div className="space-y-8">
              <div className="flex items-center justify-between pt-1">
                <Link to="/" className="inline-flex items-center gap-2">
                  <img
                    src={logoImg}
                    alt="Tolerix"
                    className="h-8 w-auto brightness-0 invert object-contain"
                  />
                </Link>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-[#9ca3af] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2.5">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.name
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setActiveTab(item.name)
                        if (item.name !== 'Jobs') {
                          setIsCreatingJob(false)
                        }
                        setMobileSidebarOpen(false)
                      }}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#242b37] text-white shadow-md'
                          : 'text-[#9ca3af] hover:text-white hover:bg-[#1c222c]'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="pt-5 border-t border-[#222732] relative">
              <button
                onClick={() => setModelMenuOpen(!modelMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#1c222c] border border-[#2b3340] text-xs font-medium text-white/90"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="font-medium text-sm">{selectedModel}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#717b8c]" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-6 sm:px-8 py-3.5 flex items-center justify-between border-b border-[#e5dcd3]/60 bg-white/40 backdrop-blur-sm sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-lg text-[#09131e] hover:bg-[#eae2d9] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/">
              <img src={logoImg} alt="Tolerix" className="h-6 w-auto object-contain" />
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => alert('No unread notifications.')}
              className="p-2 text-[#57534e] hover:text-[#09131e] rounded-full hover:bg-white/60 transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#b87d4b]" />
            </button>

            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-[#09131e] text-white flex items-center justify-center text-xs font-semibold shadow-sm">
                JD
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#78716c]" />
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 sm:px-8 py-5 sm:py-6 pb-24 sm:pb-32 space-y-4 sm:space-y-5 max-w-7xl w-full mx-auto">
          {activeTab === 'Jobs' ? (
            isCreatingJob ? (
              createStep === 1 ? (
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#78716c]">
                    <button
                      onClick={() => setIsCreatingJob(false)}
                      className="hover:text-[#09131e] transition-colors cursor-pointer"
                    >
                      Jobs
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-[#a8a29e]" />
                    <span className="text-[#09131e] font-medium">New Job</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#09131e]">
                    Create New Job
                  </h1>

                  <div className="bg-white/70 rounded-2xl p-4 sm:p-5 border border-[#e5dcd3] shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#ad7342] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        1
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-[#09131e]">
                        Order Details
                      </span>
                    </div>

                    <span className="h-px w-8 sm:w-16 bg-[#e5dcd3] hidden sm:block" />

                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full border border-[#d8cec2] bg-white text-[#78716c] flex items-center justify-center text-xs font-semibold shrink-0">
                        2
                      </span>
                      <span className="text-xs sm:text-sm text-[#78716c]">
                        Upload File
                      </span>
                    </div>

                    <span className="h-px w-8 sm:w-16 bg-[#e5dcd3] hidden sm:block" />

                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full border border-[#d8cec2] bg-white text-[#78716c] flex items-center justify-center text-xs font-semibold shrink-0">
                        3
                      </span>
                      <span className="text-xs sm:text-sm text-[#78716c]">
                        Analysis
                      </span>
                    </div>

                    <span className="h-px w-8 sm:w-16 bg-[#e5dcd3] hidden sm:block" />

                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full border border-[#d8cec2] bg-white text-[#78716c] flex items-center justify-center text-xs font-semibold shrink-0">
                        4
                      </span>
                      <span className="text-xs sm:text-sm text-[#78716c]">
                        Review
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/85 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#e5dcd3] shadow-sm space-y-6">
                    <div>
                      <h2 className="text-lg sm:text-xl font-medium text-[#09131e] mb-1">
                        Customer Instructions
                      </h2>
                      <p className="text-xs sm:text-sm text-[#57534e]">
                        Paste the customer's message or fill in the details manually.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <div className="lg:col-span-8 space-y-4">
                        <div className="relative">
                          <textarea
                            value={jobText}
                            onChange={(e) => setJobText(e.target.value)}
                            rows={5}
                            className="w-full rounded-2xl border border-[#e2d7cb] bg-white p-4 sm:p-5 text-xs sm:text-sm text-[#09131e] placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-[#ad7342]/40 transition-all shadow-inner leading-relaxed"
                          />
                          <div className="absolute right-4 bottom-3 text-[11px] text-[#a8a29e] font-mono">
                            {jobText.length} / 2,000
                          </div>
                        </div>

                        <div>
                          <button
                            onClick={() => setManualFieldsOpen(!manualFieldsOpen)}
                            className="text-xs sm:text-sm font-medium text-[#09131e] hover:text-[#ad7342] flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>Or fill in manually</span>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                manualFieldsOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {manualFieldsOpen && (
                            <div className="mt-4 p-5 rounded-2xl bg-[#faf7f3] border border-[#eee4d9] grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
                              <div>
                                <label className="block text-xs font-medium text-[#78716c] mb-1">Dimensions</label>
                                <input
                                  type="text"
                                  defaultValue="120 x 80 mm"
                                  className="w-full px-3 py-2 rounded-xl border border-[#e2d7cb] bg-white text-xs text-[#09131e]"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[#78716c] mb-1">Quantity</label>
                                <input
                                  type="number"
                                  defaultValue={10}
                                  className="w-full px-3 py-2 rounded-xl border border-[#e2d7cb] bg-white text-xs text-[#09131e]"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[#78716c] mb-1">Material</label>
                                <input
                                  type="text"
                                  defaultValue="3 mm clear acrylic"
                                  className="w-full px-3 py-2 rounded-xl border border-[#e2d7cb] bg-white text-xs text-[#09131e]"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[#78716c] mb-1">Operations</label>
                                <input
                                  type="text"
                                  defaultValue="Cut outer contour, engrave front"
                                  className="w-full px-3 py-2 rounded-xl border border-[#e2d7cb] bg-white text-xs text-[#09131e]"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="lg:col-span-4">
                        <div className="bg-[#fbf4eb] rounded-2xl p-5 border border-[#f2e6d8] flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#ad7342]/15 text-[#ad7342] flex items-center justify-center shrink-0 mt-0.5">
                            <Info className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed">
                            AI will extract the key requirements from the customer's instructions.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#f0e8de]">
                      <button
                        onClick={() => setIsCreatingJob(false)}
                        className="px-5 py-2.5 rounded-xl border border-[#d8cec2] text-xs sm:text-sm font-medium text-[#09131e] hover:bg-[#faf7f3] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setCreateStep(2)}
                        className="px-6 py-2.5 rounded-xl bg-[#ad7342] hover:bg-[#965e31] text-white text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer"
                      >
                        <span>Extract Requirements</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </section>
              ) : createStep === 2 ? (
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#78716c]">
                    <button
                      onClick={() => setIsCreatingJob(false)}
                      className="hover:text-[#09131e] transition-colors cursor-pointer"
                    >
                      Jobs
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-[#a8a29e]" />
                    <span className="text-[#09131e] font-medium">New Job</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#09131e]">
                    Create New Job
                  </h1>

                  <div className="bg-white/70 rounded-2xl p-4 sm:p-5 border border-[#e5dcd3] shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-[#09131e]">
                        Order Details
                      </span>
                    </div>

                    <span className="h-px w-8 sm:w-16 bg-[#e5dcd3] hidden sm:block" />

                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#ad7342] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        2
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-[#09131e]">
                        Upload File
                      </span>
                    </div>

                    <span className="h-px w-8 sm:w-16 bg-[#e5dcd3] hidden sm:block" />

                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full border border-[#d8cec2] bg-white text-[#78716c] flex items-center justify-center text-xs font-semibold shrink-0">
                        3
                      </span>
                      <span className="text-xs sm:text-sm text-[#78716c]">
                        Analysis
                      </span>
                    </div>

                    <span className="h-px w-8 sm:w-16 bg-[#e5dcd3] hidden sm:block" />

                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full border border-[#d8cec2] bg-white text-[#78716c] flex items-center justify-center text-xs font-semibold shrink-0">
                        4
                      </span>
                      <span className="text-xs sm:text-sm text-[#78716c]">
                        Review
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/85 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#e5dcd3] shadow-sm space-y-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-medium text-[#09131e] mb-1">
                        Upload Your Design
                      </h2>
                      <p className="text-xs sm:text-sm text-[#57534e]">
                        Upload a supported design file to get started. We'll analyze it and help you prepare the perfect cut.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <div className="lg:col-span-8 space-y-4">
                        <div className="border-2 border-dashed border-[#e2d7cb] rounded-2xl p-8 sm:p-10 text-center bg-[#fdfbf9]/60 hover:bg-[#faf7f4] transition-colors cursor-pointer flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-xl bg-[#faeee2] text-[#ad7342] flex items-center justify-center mb-3">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <p className="text-sm sm:text-base font-semibold text-[#09131e] mb-1">
                            Drag and drop your file here
                          </p>
                          <p className="text-xs text-[#78716c]">
                            or <span className="text-[#ad7342] underline font-medium">click to browse</span>
                          </p>
                          <p className="text-[11px] text-[#78716c] mt-3">
                            Supported formats: SVG, DXF, AI, EPS, PDF, PNG, JPG · Max size: 50 MB
                          </p>
                        </div>

                        {uploadedFileName && (
                          <div className="p-3.5 sm:p-4 rounded-xl border border-[#e5dcd3] bg-white flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                              <img
                                src={dash1Img}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover border border-[#e5dcd3] bg-[#faf7f3] p-0.5 shrink-0"
                              />
                              <div>
                                <p className="text-xs sm:text-sm font-medium text-[#09131e]">
                                  {uploadedFileName}
                                </p>
                                <p className="text-[11px] text-[#78716c]">1.2 MB</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setUploadedFileName('')}
                              className="p-1.5 text-[#78716c] hover:text-[#09131e] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="lg:col-span-4">
                        <div className="bg-[#fbf4eb] rounded-2xl p-5 border border-[#f2e6d8] space-y-3">
                          <div className="w-6 h-6 rounded-full bg-[#ad7342]/15 text-[#ad7342] flex items-center justify-center">
                            <Info className="w-3.5 h-3.5" />
                          </div>
                          <h3 className="text-sm font-semibold text-[#09131e]">Design tips</h3>
                          <ul className="text-xs text-[#57534e] space-y-2 leading-relaxed">
                            <li className="flex items-start gap-1.5">
                              <span>•</span>
                              <span>Use vector files (SVG, DXF, AI) for best results.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <span>•</span>
                              <span>Keep lines as closed paths.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <span>•</span>
                              <span>Remove unnecessary elements.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <span>•</span>
                              <span>Ensure correct scale and units (mm or inch).</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-[#f0e8de]">
                      <button
                        onClick={() => setCreateStep(1)}
                        className="px-5 py-2.5 rounded-xl border border-[#d8cec2] bg-white text-xs sm:text-sm font-medium text-[#09131e] hover:bg-[#faf7f3] transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        onClick={() => setCreateStep(3)}
                        className="px-6 py-2.5 rounded-xl bg-[#ad7342] hover:bg-[#965e31] text-white text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer"
                      >
                        <span>Continue to Analysis</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </section>
              ) : createStep === 3 ? (
                <section className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-[#09131e]">
                          Custom Name Tag
                        </h1>
                        <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          Needs Review
                        </span>
                        <span className="text-xs text-[#78716c] font-mono">
                          Ref: JOB-1042
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-[#57534e]">
                        <div>Client: <span className="font-medium text-[#09131e]">Maple & Co.</span></div>
                        <div>Created: <span className="font-medium text-[#09131e]">12 Nov 2024, 10:24 AM</span></div>
                        <div>Machine Profile: <span className="font-medium text-[#09131e]">Thunder Laser Nova 35</span></div>
                        <div>Version: <span className="font-medium text-[#09131e]">v1</span></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                      <button
                        onClick={() => alert('Report link copied to clipboard.')}
                        className="border border-[#d8cec2] bg-white hover:bg-[#faf7f3] text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-[#09131e] shadow-sm transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share Report</span>
                      </button>
                      <button
                        onClick={() => alert('PDF export generated.')}
                        className="bg-[#071827] hover:bg-[#0d2a45] text-white text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Export PDF</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/70 rounded-2xl p-4 sm:p-5 border border-[#e5dcd3] shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-[#09131e]">
                        Requirements
                      </span>
                    </div>

                    <span className="h-px w-8 sm:w-16 bg-[#e5dcd3] hidden sm:block" />

                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-[#09131e]">
                        File Upload
                      </span>
                    </div>

                    <span className="h-px w-8 sm:w-16 bg-[#e5dcd3] hidden sm:block" />

                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#ad7342] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        3
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-[#09131e]">
                        Analysis
                      </span>
                    </div>

                    <span className="h-px w-8 sm:w-16 bg-[#e5dcd3] hidden sm:block" />

                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full border border-[#d8cec2] bg-white text-[#78716c] flex items-center justify-center text-xs font-semibold shrink-0">
                        4
                      </span>
                      <span className="text-xs sm:text-sm text-[#78716c]">
                        Review
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    <div className="lg:col-span-3 space-y-4">
                      <div className="bg-white/85 rounded-2xl p-5 border border-[#e5dcd3] shadow-sm space-y-3.5">
                        <div className="flex items-center justify-between pb-2 border-b border-[#f0e8de]">
                          <h2 className="text-sm font-semibold text-[#09131e]">Order Requirements</h2>
                          <button
                            onClick={() => setCreateStep(1)}
                            className="p-1 rounded text-[#78716c] hover:text-[#09131e] border border-[#d8cec2] hover:bg-[#faf7f3] transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Quantity</span>
                            <span className="font-medium text-[#09131e]">10 pieces</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Size</span>
                            <span className="font-medium text-[#09131e]">120 x 80 mm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Material</span>
                            <span className="font-medium text-[#09131e]">3 mm acrylic</span>
                          </div>
                          <div>
                            <span className="text-[#78716c] block mb-1">Operations</span>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-[#faf7f3] border border-[#e5dcd3] text-[11px] text-[#09131e] font-medium">
                                Cut outside
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-[#faf7f3] border border-[#e5dcd3] text-[11px] text-[#09131e] font-medium">
                                Engrave text
                              </span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-[#f0e8de]">
                            <span className="text-[#78716c] block mb-1">Client Notes</span>
                            <p className="text-[#57534e] leading-relaxed text-[11px] bg-[#faf7f3] p-2.5 rounded-xl border border-[#e5dcd3]">
                              Make 10 acrylic tags, 120 by 80 mm, clear acrylic, cut the outside and engrave the name on the front.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/85 rounded-2xl p-5 border border-[#e5dcd3] shadow-sm space-y-3">
                        <h2 className="text-sm font-semibold text-[#09131e] pb-2 border-b border-[#f0e8de]">
                          File Information
                        </h2>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#faf7f3] border border-[#e5dcd3]">
                          <div className="w-8 h-8 rounded-lg bg-[#ad7342]/10 text-[#ad7342] flex items-center justify-center shrink-0">
                            <FileUp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#09131e] truncate">name_tag_v2.svg</p>
                            <p className="text-[10px] text-[#78716c]">42 KB · SVG Vector</p>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs text-[#57534e]">
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Canvas Size</span>
                            <span className="font-medium text-[#09131e]">100 x 60 mm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Geometry Bounds</span>
                            <span className="font-medium text-[#09131e]">100.2 x 60.1 mm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Units</span>
                            <span className="font-medium text-[#09131e]">mm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Paths</span>
                            <span className="font-medium text-[#09131e]">8 (5 cut, 3 engrave)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Layers</span>
                            <span className="font-medium text-[#09131e]">2</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Uploaded</span>
                            <span className="font-medium text-[#09131e]">12 Nov 2024, 10:31 AM</span>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[#78716c]">SHA256</span>
                            <button
                              onClick={handleCopySha}
                              className="font-mono text-[10px] text-[#09131e] flex items-center gap-1 hover:text-[#b87d4b] cursor-pointer"
                            >
                              <span>8f3a2e...9c1d</span>
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          {copiedSha && (
                            <p className="text-[10px] text-emerald-600 text-right">Hash copied</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 space-y-4">
                      <div className="bg-white/85 rounded-2xl border border-[#e5dcd3] shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#f0e8de] bg-[#faf7f3]">
                          <div className="flex items-center gap-2">
                            {(['Preview', 'Layers', 'Paths', 'Dimensions'] as const).map((tab) => (
                              <button
                                key={tab}
                                onClick={() => setCanvasTab(tab)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                  canvasTab === tab
                                    ? 'bg-white text-[#09131e] shadow-sm border border-[#e5dcd3]'
                                    : 'text-[#78716c] hover:text-[#09131e]'
                                }`}
                              >
                                {tab}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 bg-[#fdfcfb] relative">
                          <div className="relative border border-[#f0e8de] bg-white rounded-xl p-4 flex items-center justify-center min-h-[260px]">
                            <svg viewBox="0 0 320 200" className="w-full h-auto max-h-[240px]">
                              <defs>
                                <pattern id="canvas-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0e8de" strokeWidth="0.8" />
                                </pattern>
                              </defs>
                              <rect width="320" height="200" fill="url(#canvas-grid)" />

                              <g stroke="#9ca3af" strokeWidth="1" strokeDasharray="3,3">
                                <line x1="30" y1="20" x2="30" y2="190" />
                                <line x1="10" y1="30" x2="310" y2="30" />
                              </g>
                              <text x="35" y="25" fontSize="8" fill="#9ca3af" fontFamily="monospace">0</text>
                              <text x="90" y="25" fontSize="8" fill="#9ca3af" fontFamily="monospace">20</text>
                              <text x="150" y="25" fontSize="8" fill="#9ca3af" fontFamily="monospace">40</text>
                              <text x="210" y="25" fontSize="8" fill="#9ca3af" fontFamily="monospace">60</text>
                              <text x="270" y="25" fontSize="8" fill="#9ca3af" fontFamily="monospace">80</text>
                              <text x="15" y="60" fontSize="8" fill="#9ca3af" fontFamily="monospace">20</text>
                              <text x="15" y="110" fontSize="8" fill="#9ca3af" fontFamily="monospace">40</text>
                              <text x="15" y="160" fontSize="8" fill="#9ca3af" fontFamily="monospace">60</text>

                              <rect
                                x="40"
                                y="45"
                                width="220"
                                height="110"
                                rx="20"
                                ry="20"
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="2"
                              />
                              <circle cx="65" cy="100" r="8" fill="none" stroke="#ef4444" strokeWidth="2" />

                              <text
                                x="160"
                                y="112"
                                fontFamily="serif"
                                fontStyle="italic"
                                fontSize="42"
                                fill="none"
                                stroke="#1e293b"
                                strokeWidth="1.5"
                                textAnchor="middle"
                              >
                                Alex
                              </text>

                              <g stroke="#64748b" strokeWidth="1">
                                <line x1="40" y1="168" x2="260" y2="168" />
                                <line x1="40" y1="163" x2="40" y2="173" />
                                <line x1="260" y1="163" x2="260" y2="173" />
                              </g>
                              <text x="150" y="180" fontSize="9" fill="#0f172a" fontFamily="monospace" textAnchor="middle">
                                100.2 mm
                              </text>

                              <g stroke="#64748b" strokeWidth="1">
                                <line x1="272" y1="45" x2="272" y2="155" />
                                <line x1="267" y1="45" x2="277" y2="45" />
                                <line x1="267" y1="155" x2="277" y2="155" />
                              </g>
                              <text x="282" y="103" fontSize="9" fill="#0f172a" fontFamily="monospace">
                                60.1 mm
                              </text>
                            </svg>
                          </div>

                          <div className="flex items-center justify-between pt-3 text-xs">
                            <div className="flex items-center gap-1.5 text-[#78716c]">
                              <button className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-[#09131e] border border-[#e5dcd3]">
                                <ZoomIn className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-[#09131e] border border-[#e5dcd3]">
                                <ZoomOut className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-[#09131e] border border-[#e5dcd3]">
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#faf7f3] border border-[#e5dcd3] text-[11px] text-[#09131e]">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                <span>Cut (5 paths)</span>
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#faf7f3] border border-[#e5dcd3] text-[11px] text-[#09131e]">
                                <span className="w-2 h-2 rounded-full bg-stone-800" />
                                <span>Engrave (3 paths)</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/85 rounded-2xl p-4 sm:p-5 border border-[#e5dcd3] shadow-sm space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78716c]">
                          Geometry Comparison
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
                          <div className="p-3 rounded-xl border border-[#e5dcd3] bg-[#faf7f3] text-center space-y-1.5">
                            <p className="text-[11px] text-[#78716c]">Requested Size</p>
                            <div className="h-12 border border-[#9ca3af] rounded-lg bg-white flex items-center justify-center font-mono text-[11px] font-semibold text-[#09131e]">
                              120 x 80 mm
                            </div>
                          </div>

                          <div className="p-3 rounded-xl border border-red-200 bg-red-50/50 text-center space-y-1.5">
                            <p className="text-[11px] text-red-700">Detected Size</p>
                            <div className="h-12 border-2 border-red-500 rounded-lg bg-white flex items-center justify-center font-mono text-[11px] font-semibold text-red-600">
                              100.2 x 60.1 mm
                            </div>
                          </div>

                          <div className="p-3 rounded-xl border border-red-200 bg-red-50/70 space-y-1 text-left">
                            <div className="flex items-center gap-1 text-red-700 font-semibold text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>Dimensions do not match</span>
                            </div>
                            <p className="text-[10px] text-red-800 leading-tight">
                              The file dimensions (100.2 x 60.1 mm) do not match the requested size (120 x 80 mm).
                            </p>
                            <button
                              onClick={() => alert('Discrepancy: width is 19.8 mm under tolerance, height is 19.9 mm under tolerance.')}
                              className="text-[10px] font-semibold text-red-700 underline cursor-pointer pt-0.5 block"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-4 space-y-4">
                      <div className="bg-white/85 rounded-2xl p-5 border border-[#e5dcd3] shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#f0e8de]">
                          <div>
                            <h2 className="text-sm font-semibold text-[#09131e]">Analysis Results</h2>
                            <p className="text-[11px] text-[#78716c]">Completed in 12.4s</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                          <div className="p-2 rounded-xl bg-red-50 border border-red-200">
                            <p className="font-semibold text-red-700">2</p>
                            <p className="text-[10px] text-red-800">Issues</p>
                          </div>
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                            <p className="font-semibold text-amber-700">3</p>
                            <p className="text-[10px] text-amber-800">Warnings</p>
                          </div>
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                            <p className="font-semibold text-emerald-700">6</p>
                            <p className="text-[10px] text-emerald-800">Passed</p>
                          </div>
                          <div className="p-2 rounded-xl bg-stone-100 border border-stone-200">
                            <p className="font-semibold text-stone-700">2</p>
                            <p className="text-[10px] text-stone-800">Unverified</p>
                          </div>
                        </div>

                        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                          <div className="p-3 rounded-xl bg-red-50/60 border border-red-200 flex items-start justify-between gap-2 text-xs">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-red-900">Part width does not match</p>
                              <p className="text-[11px] text-red-700">Expected 120 mm, found 100.2 mm</p>
                            </div>
                            <span className="text-[10px] font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full shrink-0">
                              High
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-red-50/60 border border-red-200 flex items-start justify-between gap-2 text-xs">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-red-900">Part height does not match</p>
                              <p className="text-[11px] text-red-700">Expected 80 mm, found 60.1 mm</p>
                            </div>
                            <span className="text-[10px] font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full shrink-0">
                              High
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex items-start justify-between gap-2 text-xs">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-amber-900">Material thickness not specified</p>
                              <p className="text-[11px] text-amber-700">Cannot be verified from SVG file</p>
                            </div>
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                              Medium
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex items-start justify-between gap-2 text-xs">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-amber-900">Expected quantity not detected</p>
                              <p className="text-[11px] text-amber-700">Found 1 part, expected 10</p>
                            </div>
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                              Medium
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex items-start justify-between gap-2 text-xs">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-amber-900">No engraving layer name match</p>
                              <p className="text-[11px] text-amber-700">Expected layer name "ENGRAVE"</p>
                            </div>
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                              Medium
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-start justify-between gap-2 text-xs">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-emerald-900">Valid SVG structure</p>
                              <p className="text-[11px] text-emerald-700">File is a valid SVG document</p>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                              Passed
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-start justify-between gap-2 text-xs">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-emerald-900">Cut paths are closed</p>
                              <p className="text-[11px] text-emerald-700">All 5 cut paths are properly closed</p>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                              Passed
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-start justify-between gap-2 text-xs">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-emerald-900">No overlapping geometry</p>
                              <p className="text-[11px] text-emerald-700">No duplicate or overlapping paths found</p>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                              Passed
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => alert('Displaying all 13 geometry and specification validation checks.')}
                          className="w-full text-center text-xs font-medium text-[#ad7342] hover:underline pt-1 block cursor-pointer"
                        >
                          View all findings →
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-[#f0e8de]">
                    <button
                      onClick={() => setCreateStep(2)}
                      className="px-5 py-2.5 rounded-xl border border-[#d8cec2] bg-white text-xs sm:text-sm font-medium text-[#09131e] hover:bg-[#faf7f3] transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Upload</span>
                    </button>
                    <button
                      onClick={() => setCreateStep(4)}
                      className="px-6 py-2.5 rounded-xl bg-[#ad7342] hover:bg-[#965e31] text-white text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Review</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </section>
              ) : (
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#78716c]">
                    <button
                      onClick={() => setIsCreatingJob(false)}
                      className="hover:text-[#09131e] transition-colors cursor-pointer"
                    >
                      Jobs
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-[#a8a29e]" />
                    <button
                      onClick={() => setCreateStep(1)}
                      className="hover:text-[#09131e] transition-colors cursor-pointer"
                    >
                      New Job
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-[#a8a29e]" />
                    <span className="text-[#09131e] font-medium">Review</span>
                  </div>

                  <div>
                    <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#09131e] mb-1">
                      Review & Submit
                    </h1>
                    <p className="text-xs sm:text-sm text-[#57534e]">
                      Take a final look at your design and settings before sending it to production.
                    </p>
                  </div>

                  <div className="bg-white/70 rounded-2xl p-4 sm:p-5 border border-[#e5dcd3] shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-[#09131e]">
                        Order Details
                      </span>
                    </div>

                    <span className="h-px w-8 sm:w-16 bg-[#e5dcd3] hidden sm:block" />

                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-[#09131e]">
                        Upload File
                      </span>
                    </div>

                    <span className="h-px w-8 sm:w-16 bg-[#e5dcd3] hidden sm:block" />

                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-[#09131e]">
                        Confirm Requirements
                      </span>
                    </div>

                    <span className="h-px w-8 sm:w-16 bg-[#e5dcd3] hidden sm:block" />

                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#ad7342] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        4
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-[#09131e]">
                        Review
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-7 space-y-5">
                      <div className="bg-white/85 rounded-2xl sm:rounded-3xl p-6 border border-[#e5dcd3] shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-[#f0e8de]">
                          <h2 className="text-base font-medium text-[#09131e]">Design Preview</h2>
                          <button
                            onClick={() => alert('Viewing full resolution rendering.')}
                            className="text-xs font-medium text-[#78716c] hover:text-[#09131e] border border-[#d8cec2] px-3 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer bg-white"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Fit to view</span>
                          </button>
                        </div>

                        <div className="rounded-2xl overflow-hidden border border-[#e5dcd3] bg-stone-100 aspect-[16/10]">
                          <img
                            src={activeGalleryImg}
                            alt="Design Preview"
                            className="w-full h-full object-cover transition-all duration-300"
                          />
                        </div>

                        <div className="grid grid-cols-4 gap-3 pt-2">
                          {[dash1Img, h3Img, h4Img, sec2Img].map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveGalleryImg(img)}
                              className={`rounded-xl overflow-hidden border-2 transition-all aspect-video cursor-pointer ${
                                activeGalleryImg === img
                                  ? 'border-[#ad7342] shadow-sm'
                                  : 'border-[#e5dcd3] hover:border-[#b87d4b]/60 opacity-80 hover:opacity-100'
                              }`}
                            >
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white/85 rounded-2xl sm:rounded-3xl p-6 border border-[#e5dcd3] shadow-sm space-y-3">
                        <h2 className="text-base font-medium text-[#09131e]">Notes (Optional)</h2>
                        <textarea
                          rows={3}
                          placeholder="Add any additional notes for the workshop..."
                          className="w-full rounded-2xl border border-[#e2d7cb] bg-white p-4 text-xs sm:text-sm text-[#09131e] placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-[#ad7342]/40 transition-all shadow-inner leading-relaxed"
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-5 space-y-4">
                      <div className="bg-white/85 rounded-2xl p-5 border border-[#e5dcd3] shadow-sm space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#f0e8de]">
                          <h3 className="text-sm font-semibold text-[#09131e]">Job Details</h3>
                          <button
                            onClick={() => setCreateStep(1)}
                            className="text-xs font-medium text-[#78716c] hover:text-[#09131e] border border-[#d8cec2] px-2.5 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer bg-white"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Job Name</span>
                            <span className="font-medium text-[#09131e]">Custom Name Tag</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Client</span>
                            <span className="font-medium text-[#09131e]">Maple & Co.</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Quantity</span>
                            <span className="font-medium text-[#09131e]">10 pieces</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Due Date</span>
                            <span className="font-medium text-[#09131e]">Oct 20, 2026</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/85 rounded-2xl p-5 border border-[#e5dcd3] shadow-sm space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#f0e8de]">
                          <h3 className="text-sm font-semibold text-[#09131e]">File Information</h3>
                          <button
                            onClick={() => setCreateStep(2)}
                            className="text-xs font-medium text-[#78716c] hover:text-[#09131e] border border-[#d8cec2] px-2.5 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer bg-white"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#faf7f3] border border-[#e5dcd3]">
                          <img
                            src={dash1Img}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-[#e5dcd3] bg-white p-0.5 shrink-0"
                          />
                          <div>
                            <p className="text-xs font-semibold text-[#09131e]">flower_panel.dxf</p>
                            <p className="text-[10px] text-[#78716c]">1.2 MB · DXF</p>
                          </div>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Dimensions</span>
                            <span className="font-medium text-[#09131e]">120 x 80 mm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Material Thickness</span>
                            <span className="font-medium text-[#09131e]">3 mm</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/85 rounded-2xl p-5 border border-[#e5dcd3] shadow-sm space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#f0e8de]">
                          <h3 className="text-sm font-semibold text-[#09131e]">Machine Profile</h3>
                          <button
                            onClick={() => setCreateStep(2)}
                            className="text-xs font-medium text-[#78716c] hover:text-[#09131e] border border-[#d8cec2] px-2.5 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer bg-white"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#faf7f3] border border-[#e5dcd3]">
                          <div className="w-12 h-10 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0 font-mono text-[10px]">
                            LASER
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#09131e]">Thunder Laser Nova 35</p>
                            <p className="text-[10px] text-[#78716c]">Bed Size: 600 x 900 mm</p>
                            <p className="text-[10px] text-[#78716c]">Max Material Thickness: 10 mm</p>
                            <p className="text-[10px] text-[#78716c]">Cutting Method: CO2 Laser</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/85 rounded-2xl p-5 border border-[#e5dcd3] shadow-sm space-y-3">
                        <h3 className="text-sm font-semibold text-[#09131e] pb-2 border-b border-[#f0e8de]">
                          Estimated Usage
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-[#faf7f3] border border-[#e5dcd3] space-y-1">
                            <div className="flex items-center gap-1.5 text-[#78716c]">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Estimated Time</span>
                            </div>
                            <p className="text-base font-semibold text-[#09131e]">~ 12 min</p>
                          </div>
                          <div className="p-3 rounded-xl bg-[#faf7f3] border border-[#e5dcd3] space-y-1">
                            <p className="text-[11px] text-[#78716c]">Estimated Material Cost</p>
                            <p className="text-base font-semibold text-[#09131e]">~ $14.50</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#f0e8de]">
                    <label className="flex items-start gap-2.5 text-xs text-[#57534e] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={reviewConfirmed}
                        onChange={(e) => setReviewConfirmed(e.target.checked)}
                        className="mt-0.5 rounded border-[#d8cec2] text-[#ad7342] focus:ring-[#ad7342]/40"
                      />
                      <span>
                        I confirm that this design does not infringe on any third-party rights and I have the necessary permissions to produce it.
                      </span>
                    </label>

                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => setCreateStep(3)}
                        className="px-5 py-2.5 rounded-xl border border-[#d8cec2] bg-white text-xs sm:text-sm font-medium text-[#09131e] hover:bg-[#faf7f3] transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        onClick={handleFinishNewJob}
                        disabled={!reviewConfirmed}
                        className={`px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer ${
                          reviewConfirmed
                            ? 'bg-[#ad7342] hover:bg-[#965e31]'
                            : 'bg-[#ad7342]/50 cursor-not-allowed'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        <span>Send to Production</span>
                      </button>
                    </div>
                  </div>
                </section>
              )
            ) : (
              <section className="bg-white/85 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#e5dcd3] shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#f0e8de]">
                  <div>
                    <h2 className="text-xl font-medium text-[#09131e]">Jobs Queue</h2>
                    <p className="text-xs text-[#78716c]">Complete list of active manufacturing preflight runs</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('Dashboard')}
                    className="text-xs font-medium text-[#b87d4b] hover:underline cursor-pointer"
                  >
                    Back to Dashboard
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center p-8 bg-white/70 rounded-2xl border border-dashed border-[#d8cec2] text-center space-y-3">
                  <p className="text-sm font-medium text-[#09131e]">
                    Audit a new production file against customer instructions
                  </p>
                  <button
                    onClick={() => {
                      setCreateStep(1)
                      setIsCreatingJob(true)
                    }}
                    className="rounded-xl bg-[#ad7342] hover:bg-[#965e31] text-white px-6 py-2.5 text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Job</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-[#f0e8de] text-[11px] font-medium text-[#78716c]">
                        <th className="pb-2.5 font-medium">Job Name</th>
                        <th className="pb-2.5 font-medium">Customer</th>
                        <th className="pb-2.5 font-medium">Status</th>
                        <th className="pb-2.5 font-medium">Last Updated</th>
                        <th className="pb-2.5 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f7f2eb]">
                      {jobsList.map((job) => (
                        <tr key={job.id} className="group hover:bg-[#faf7f3] transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={job.thumb}
                                alt=""
                                className="w-9 h-7 rounded-md object-cover border border-[#e5dcd3] bg-stone-100 shrink-0"
                              />
                              <span className="font-medium text-[#09131e]">{job.name}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-[#57534e]">{job.customer}</td>
                          <td className="py-3 pr-4">
                            {job.statusType === 'review' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Needs Review</span>
                              </span>
                            )}
                            {job.statusType === 'ready' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Ready</span>
                              </span>
                            )}
                            {job.statusType === 'progress' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3" />
                                <span>In Progress</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-[#78716c] text-xs">{job.updated}</td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={handleOpenJob}
                                className="p-1.5 rounded-lg text-[#57534e] hover:text-[#09131e] hover:bg-stone-100 transition-colors cursor-pointer"
                                title="Redo Preflight"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setJobsList((prev) => prev.filter((j) => j.id !== job.id))}
                                className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete Job"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )
          ) : activeTab !== 'Dashboard' ? (
            <section className="bg-white/85 rounded-2xl sm:rounded-3xl p-8 border border-[#e5dcd3] shadow-sm text-center space-y-4">
              <h2 className="text-xl font-medium text-[#09131e]">{activeTab}</h2>
              <p className="text-sm text-[#57534e] max-w-md mx-auto">
                Configure settings and workspace preferences for your manufacturing pipeline.
              </p>
              <button
                onClick={() => setActiveTab('Dashboard')}
                className="text-xs font-medium text-[#b87d4b] hover:underline cursor-pointer"
              >
                Back to Dashboard
              </button>
            </section>
          ) : (
            <>
              <section
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[140px] sm:min-h-[160px] flex items-center p-5 sm:p-7 border border-[#e5dcd3] bg-cover bg-[position:85%_center] lg:bg-right bg-no-repeat shadow-sm"
                style={{ backgroundImage: `url(${dash1Img})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#f5ede4] via-[#f5ede4]/95 via-50% to-transparent pointer-events-none" />

                <div className="relative max-w-lg z-10">
                  <h1 className="text-xl sm:text-2xl lg:text-[26px] font-medium tracking-tight text-[#09131e] mb-1.5 leading-snug">
                    Precision before production.
                  </h1>
                  <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed mb-4 max-w-md">
                    Check customer designs against their requirements, catch issues early, and keep your laser cutting projects on track.
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={handleStartNewJobFlow}
                      className="rounded-xl bg-[#b87d4b] hover:bg-[#a06837] text-white text-xs sm:text-sm font-medium px-4 py-2 transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Job</span>
                    </button>
                    <button
                      onClick={handleOpenExample}
                      className="rounded-xl border border-[#d8cec2] bg-white/80 hover:bg-white text-[#09131e] text-xs sm:text-sm font-medium px-4 py-2 transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      View Example
                    </button>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {stats.map((s) => {
                  const Icon = s.icon
                  return (
                    <div
                      key={s.label}
                      className="bg-white/85 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-[#e5dcd3] shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${s.iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-lg sm:text-xl font-semibold text-[#09131e] leading-tight mb-0.5">
                            {s.num}
                          </p>
                          <p className="text-[11px] sm:text-xs text-[#78716c] leading-tight">
                            {s.label}
                          </p>
                        </div>
                      </div>
                      {s.badge && (
                        <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                          {s.badge}
                        </span>
                      )}
                    </div>
                  )
                })}
              </section>

              <section className="bg-white/85 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#e5dcd3] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm sm:text-base font-medium text-[#09131e]">
                    Recent Jobs
                  </h2>
                  <button
                    onClick={() => setActiveTab('Jobs')}
                    className="text-xs font-medium text-[#b87d4b] hover:text-[#9c6536] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-[#f0e8de] text-[11px] font-medium text-[#78716c]">
                        <th className="pb-2.5 font-medium">Job Name</th>
                        <th className="pb-2.5 font-medium hidden sm:table-cell">Customer</th>
                        <th className="pb-2.5 font-medium">Status</th>
                        <th className="pb-2.5 font-medium hidden md:table-cell">Last Updated</th>
                        <th className="pb-2.5 font-medium text-right" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f7f2eb]">
                      {jobsList.map((job) => {
                        return (
                          <tr key={job.id} className="group hover:bg-[#faf7f3] transition-colors">
                            <td className="py-2.5 pr-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={job.thumb}
                                  alt=""
                                  className="w-9 h-7 rounded-md object-cover border border-[#e5dcd3] bg-stone-100 shrink-0"
                                />
                                <span className="font-medium text-[#09131e]">{job.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 pr-4 text-[#57534e] hidden sm:table-cell text-xs sm:text-sm">
                              {job.customer}
                            </td>
                            <td className="py-2.5 pr-4">
                              {job.statusType === 'review' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Needs Review</span>
                                </span>
                              )}
                              {job.statusType === 'ready' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Ready</span>
                                </span>
                              )}
                              {job.statusType === 'progress' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                  <Clock className="w-3 h-3" />
                                  <span>In Progress</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 pr-4 text-[#78716c] text-xs hidden md:table-cell">
                              {job.updated}
                            </td>
                            <td className="py-2.5 text-right relative">
                              <button
                                onClick={() => setOpenActionMenuId(openActionMenuId === job.id ? null : job.id)}
                                className="p-1 rounded text-[#78716c] hover:text-[#09131e] hover:bg-stone-100 transition-colors cursor-pointer"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>

                              {openActionMenuId === job.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setOpenActionMenuId(null)}
                                  />
                                  <div className="absolute right-0 top-full mt-1 w-28 bg-white rounded-xl border border-[#e5dcd3] shadow-lg p-1 z-30 space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100">
                                    <button
                                      onClick={() => {
                                        setOpenActionMenuId(null)
                                        handleOpenJob()
                                      }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#09131e] hover:bg-[#faf7f3] transition-colors cursor-pointer"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5 text-[#b87d4b]" />
                                      <span>Redo</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setOpenActionMenuId(null)
                                        setJobsList((prev) => prev.filter((j) => j.id !== job.id))
                                      }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

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
                      <p className="text-sm font-medium text-[#1c1917]">name_tag_v2.svg</p>
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
