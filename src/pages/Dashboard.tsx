import { useState, useEffect, useRef, type DragEvent, type ChangeEvent } from 'react'
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
  FileDown,
  HardDrive,
  ShieldCheck,
  Download
} from 'lucide-react'
import logoImg from '../assets/logo.webp'
import dash1Img from '../assets/dash1.webp'
import h2Img from '../assets/h2.webp'
import h3Img from '../assets/h3.webp'
import h4Img from '../assets/h4.webp'
import sec2Img from '../assets/2.webp'

import { initializeDatabase } from '../lib/db/database'
import { jobRepository } from '../lib/db/repositories/jobs'
import { fileRepository } from '../lib/db/repositories/files'
import { machineProfileRepository } from '../lib/db/repositories/machineProfiles'
import { auditService } from '../lib/audit/auditService'
import { jobService } from '../lib/workflow/jobService'
import { validateDesignFile } from '../lib/files/fileValidation'
import { extractRequirementsHeuristic } from '../lib/ai/extraction'
import {
  downloadModel,
  removeCachedModel,
  isModelCached,
  cachedModelBytes,
  type ModelStoreProgress
} from '../lib/ai/modelStore'
import { detectBrowserCapabilities, type BrowserCapabilities } from '../lib/ai/capabilities'
import { generateHtmlReport, generateJsonReport, triggerDownload } from '../lib/reports/reportService'
import { formatBytes } from '../lib/ai/modelConfig'
import type {
  Job,
  JobSpecification,
  DesignFile,
  MachineProfile,
  AuditRun,
  Finding
} from '../lib/validation/schemas'
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Jobs' | 'Machine Profiles' | 'Reports' | 'Settings'>('Dashboard')
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
  const [copiedSha, setCopiedSha] = useState(false)

  const [jobsList, setJobsList] = useState<Job[]>([])
  const [stats, setStats] = useState({
    total: 0,
    ready: 0,
    needsReview: 0,
    inProgress: 0
  })
  const [machineProfiles, setMachineProfiles] = useState<MachineProfile[]>([])
  const [capabilities, setCapabilities] = useState<BrowserCapabilities | null>(null)

  const [modelStatus, setModelStatus] = useState<Record<string, { cached: boolean; bytes: number | null }>>({
    'gemma-4b': { cached: false, bytes: null },
    'gemma-2b': { cached: false, bytes: null }
  })
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<ModelStoreProgress | null>(null)
  const downloadAbortControllerRef = useRef<AbortController | null>(null)

  const [currentJob, setCurrentJob] = useState<Job | null>(null)
  const [currentSpec, setCurrentSpec] = useState<JobSpecification | null>(null)
  const [currentFile, setCurrentFile] = useState<DesignFile | null>(null)
  const [currentAuditRun, setCurrentAuditRun] = useState<AuditRun | null>(null)
  const [currentFindings, setCurrentFindings] = useState<Finding[]>([])

  const [jobNameInput, setJobNameInput] = useState('')
  const [customerNameInput, setCustomerNameInput] = useState('')
  const [jobText, setJobText] = useState('')
  const [manualWidth, setManualWidth] = useState(0)
  const [manualHeight, setManualHeight] = useState(0)
  const [manualQty, setManualQty] = useState(1)
  const [manualMaterial, setManualMaterial] = useState('')
  const [manualThickness, setManualThickness] = useState(0)
  const [manualOperations, setManualOperations] = useState('')

  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const navItems = [
    { name: 'Dashboard' as const, icon: Home },
    { name: 'Jobs' as const, icon: FileText },
    { name: 'Machine Profiles' as const, icon: Cpu },
    { name: 'Reports' as const, icon: BarChart2 },
    { name: 'Settings' as const, icon: Settings }
  ]

  const loadData = async () => {
    await initializeDatabase()
    const [jobs, counts, profiles, caps] = await Promise.all([
      jobRepository.list(),
      jobRepository.getCounts(),
      machineProfileRepository.list(),
      detectBrowserCapabilities()
    ])

    setJobsList(jobs)
    setStats({
      total: counts.total,
      ready: counts.ready,
      needsReview: counts.needsReview,
      inProgress: counts.inProgress
    })
    setMachineProfiles(profiles)
    setCapabilities(caps)

    const [cached4b, bytes4b, cached2b, bytes2b] = await Promise.all([
      isModelCached('gemma-4b'),
      cachedModelBytes('gemma-4b'),
      isModelCached('gemma-2b'),
      cachedModelBytes('gemma-2b')
    ])

    setModelStatus({
      'gemma-4b': { cached: cached4b, bytes: bytes4b },
      'gemma-2b': { cached: cached2b, bytes: bytes2b }
    })
  }
  useEffect(() => {
    let isSubscribed = true
    const init = async () => {
      await initializeDatabase()
      const [jobs, counts, profiles, caps, c4b, b4b, c2b, b2b] = await Promise.all([
        jobRepository.list(),
        jobRepository.getCounts(),
        machineProfileRepository.list(),
        detectBrowserCapabilities(),
        isModelCached('gemma-4b'),
        cachedModelBytes('gemma-4b'),
        isModelCached('gemma-2b'),
        cachedModelBytes('gemma-2b')
      ])

      if (!isSubscribed) return
      setJobsList(jobs)
      setStats({
        total: counts.total,
        ready: counts.ready,
        needsReview: counts.needsReview,
        inProgress: counts.inProgress
      })
      setMachineProfiles(profiles)
      setCapabilities(caps)
      setModelStatus({
        'gemma-4b': { cached: c4b, bytes: b4b },
        'gemma-2b': { cached: c2b, bytes: b2b }
      })
    }
    init()
    return () => {
      isSubscribed = false
    }
  }, [])
  const handleStartNewJobFlow = () => {
    setActiveTab('Jobs')
    setIsCreatingJob(true)
    setCreateStep(1)
    setUploadError(null)
    setJobNameInput('')
    setCustomerNameInput('')
    setJobText('')
    setUploadedFileName('')
    setManualWidth(0)
    setManualHeight(0)
    setManualQty(1)
    setManualMaterial('')
    setManualThickness(0)
    setManualOperations('')
    setCurrentJob(null)
    setCurrentSpec(null)
    setCurrentFile(null)
    setCurrentAuditRun(null)
    setCurrentFindings([])
  }

  const handleCreateStep1Submit = async () => {
    const selectedModelId = selectedModel === 'Gemma 4B' ? 'gemma-4b' : 'gemma-2b'
    const jobName = jobNameInput.trim() || 'Untitled Job'
    const customerName = customerNameInput.trim() || 'Direct Customer'
    const newJob = await jobService.createJobWithInstructions({
      name: jobName,
      customerName: customerName,
      instructions: jobText,
      selectedModelId
    })

    const extracted = extractRequirementsHeuristic(jobText)
    const spec: JobSpecification = {
      id: `spec-${newJob.id}`,
      jobId: newJob.id,
      quantity: manualQty || extracted.quantity || 1,
      width: manualWidth || extracted.width || 0,
      height: manualHeight || extracted.height || 0,
      units: extracted.units || 'mm',
      material: manualMaterial || extracted.material || 'acrylic',
      thickness: manualThickness || extracted.thickness || 0,
      operations:
        manualOperations
          ? manualOperations.split(',').map((s) => s.trim()).filter(Boolean)
          : extracted.operations.length > 0
            ? extracted.operations
            : ['cut'],
      expectedCutLayers: extracted.expectedCutLayers,
      expectedEngraveLayers: extracted.expectedEngraveLayers,
      tolerances: { width: 0.5, height: 0.5 },
      fieldStates: {},
      sourceExcerpts: extracted.sourceExcerpts,
      updatedAt: Date.now()
    }
    await jobRepository.upsertSpecification(spec)

    setCurrentJob(newJob)
    setCurrentSpec(spec)
    setCreateStep(2)
  }

  const processUploadedFile = async (file: File) => {
    setUploadError(null)
    const validation = await validateDesignFile(file, file.name)
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file format or structure.')
      return
    }

    setUploadedFileName(file.name)

    if (currentJob) {
      const designFile = await jobService.attachUploadedFile(currentJob.id, file, file.name)
      setCurrentFile(designFile)
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processUploadedFile(file)
    }
  }

  const handleDropFile = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processUploadedFile(file)
    }
  }

  const handleProceedToAnalysis = async () => {
    if (!currentJob) return

    let file = currentFile
    if (!file) {
      const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="60mm" viewBox="0 0 100 60">
        <rect x="0" y="0" width="100.2" height="60.1" rx="5" stroke="red" fill="none" />
        <circle cx="10" cy="30" r="3" stroke="red" fill="none" />
        <path d="M 30 35 Q 50 15 70 35" stroke="#1e293b" fill="none" />
      </svg>`
      const blob = new Blob([sampleSvg], { type: 'image/svg+xml' })
      file = await jobService.attachUploadedFile(currentJob.id, blob, 'name_tag_v2.svg')
      setCurrentFile(file)
      setUploadedFileName('name_tag_v2.svg')
    }

    const auditRes = await auditService.runAudit(currentJob.id)
    setCurrentAuditRun(auditRes.run)
    setCurrentFindings(auditRes.findings)
    setCreateStep(3)
  }

  const handleFinishNewJob = async () => {
    if (!currentJob) return
    await jobService.approveJob(currentJob.id)
    await loadData()
    setIsCreatingJob(false)
    setCreateStep(1)
  }

  const handleDeleteJob = async (jobId: string) => {
    await jobRepository.delete(jobId)
    await loadData()
  }

  const handleRedoJob = async (job: Job) => {
    setCurrentJob(job)
    const spec = await jobRepository.getSpecification(job.id)
    setCurrentSpec(spec ?? null)
    const file = await fileRepository.getByJobId(job.id)
    setCurrentFile(file ?? null)
    setActiveTab('Jobs')
    setIsCreatingJob(true)
    setCreateStep(3)
    const auditRes = await auditService.runAudit(job.id)
    setCurrentAuditRun(auditRes.run)
    setCurrentFindings(auditRes.findings)
  }

  const handleExportPdfReport = async () => {
    if (!currentJob) return
    const bundle = await jobService.getFullReportBundle(currentJob.id)
    const html = generateHtmlReport(bundle)
    triggerDownload(html, `${currentJob.name}-report.html`, 'text/html')
  }

  const handleShareReport = async () => {
    if (!currentJob) return
    const bundle = await jobService.getFullReportBundle(currentJob.id)
    const json = generateJsonReport(bundle)
    await navigator.clipboard.writeText(json)
    alert('Full audit report JSON copied to clipboard.')
  }

  const handleDownloadModel = async (modelId: 'gemma-4b' | 'gemma-2b') => {
    if (downloadingModelId) return
    setDownloadingModelId(modelId)
    setDownloadProgress({ receivedBytes: 0, totalBytes: null })
    const controller = new AbortController()
    downloadAbortControllerRef.current = controller

    try {
      await downloadModel(
        modelId,
        (progress) => {
          setDownloadProgress(progress)
        },
        controller.signal
      )
      await loadData()
      alert(`${modelId} download complete and cached locally.`)
    } catch (error) {
      if (!controller.signal.aborted) {
        alert(error instanceof Error ? error.message : 'Model download failed.')
      }
    } finally {
      setDownloadingModelId(null)
      setDownloadProgress(null)
      downloadAbortControllerRef.current = null
    }
  }

  const handleCancelDownload = () => {
    if (downloadAbortControllerRef.current) {
      downloadAbortControllerRef.current.abort()
      downloadAbortControllerRef.current = null
      setDownloadingModelId(null)
      setDownloadProgress(null)
    }
  }

  const handleDeleteModel = async (modelId: string) => {
    await removeCachedModel(modelId)
    await loadData()
  }

  const handleCopySha = () => {
    setCopiedSha(true)
    setTimeout(() => setCopiedSha(false), 2000)
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
              <div className="fixed inset-0 z-20" onClick={() => setModelMenuOpen(false)} />
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1c222c] border border-[#2b3340] rounded-2xl p-2 shadow-xl z-30 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-semibold text-[#717b8c]">
                  Select Model Runtime
                </div>
                {(['Gemma 4B', 'Gemma 2B'] as const).map((modelName) => {
                  const mId = modelName === 'Gemma 4B' ? 'gemma-4b' : 'gemma-2b'
                  const isCached = modelStatus[mId]?.cached
                  return (
                    <button
                      key={modelName}
                      onClick={() => {
                        setSelectedModel(modelName)
                        setModelMenuOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        selectedModel === modelName
                          ? 'bg-[#28313f] text-white'
                          : 'text-[#9ca3af] hover:text-white hover:bg-[#232a36]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isCached ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span>{modelName}</span>
                      </div>
                      <span className="text-[10px] text-[#78716c]">
                        {isCached ? 'Cached' : 'Remote'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          <button
            onClick={() => setModelMenuOpen(!modelMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#1c222c] border border-[#2b3340] text-xs font-medium text-white/90 hover:border-[#3d485a] hover:bg-[#202733] transition-all cursor-pointer shadow-sm relative z-10"
          >
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                modelStatus[selectedModel === 'Gemma 4B' ? 'gemma-4b' : 'gemma-2b']?.cached
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
              }`} />
              <span className="font-medium text-sm">{selectedModel}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-[#717b8c] transition-transform duration-200 ${modelMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-72 bg-[#161a22] text-[#9ca3af] flex flex-col justify-between p-6 z-10 h-full">
            <div className="space-y-8">
              <div className="flex items-center justify-between pt-1">
                <Link to="/" className="inline-flex items-center gap-2">
                  <img src={logoImg} alt="Tolerix" className="h-8 w-auto brightness-0 invert object-contain" />
                </Link>
                <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-lg text-[#9ca3af] hover:text-white">
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
                        if (item.name !== 'Jobs') setIsCreatingJob(false)
                        setMobileSidebarOpen(false)
                      }}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                        isActive ? 'bg-[#242b37] text-white shadow-md' : 'text-[#9ca3af] hover:text-white hover:bg-[#1c222c]'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-6 sm:px-8 py-3.5 flex items-center justify-between border-b border-[#e5dcd3]/60 bg-white/40 backdrop-blur-sm sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setMobileSidebarOpen(true)} className="p-2 rounded-lg text-[#09131e] hover:bg-[#eae2d9] transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/">
              <img src={logoImg} alt="Tolerix" className="h-6 w-auto object-contain" />
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-4 sm:gap-6">
            <button onClick={() => alert('All preflight jobs up to date.')} className="p-2 text-[#57534e] hover:text-[#09131e] rounded-full hover:bg-white/60 transition-colors relative cursor-pointer" aria-label="Notifications">
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
                    <button onClick={() => setIsCreatingJob(false)} className="hover:text-[#09131e] transition-colors cursor-pointer">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                      <div>
                        <label className="block text-xs font-medium text-[#78716c] mb-1">Job Name</label>
                        <input
                          type="text"
                          value={jobNameInput}
                          onChange={(e) => setJobNameInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2d7cb] bg-white text-xs sm:text-sm text-[#09131e]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#78716c] mb-1">Client Name</label>
                        <input
                          type="text"
                          value={customerNameInput}
                          onChange={(e) => setCustomerNameInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2d7cb] bg-white text-xs sm:text-sm text-[#09131e]"
                        />
                      </div>
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
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${manualFieldsOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {manualFieldsOpen && (
                            <div className="mt-4 p-5 rounded-2xl bg-[#faf7f3] border border-[#eee4d9] grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
                              <div>
                                <label className="block text-xs font-medium text-[#78716c] mb-1">Width (mm)</label>
                                <input
                                  type="number"
                                  value={manualWidth}
                                  onChange={(e) => setManualWidth(parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 rounded-xl border border-[#e2d7cb] bg-white text-xs text-[#09131e]"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[#78716c] mb-1">Height (mm)</label>
                                <input
                                  type="number"
                                  value={manualHeight}
                                  onChange={(e) => setManualHeight(parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 rounded-xl border border-[#e2d7cb] bg-white text-xs text-[#09131e]"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[#78716c] mb-1">Quantity</label>
                                <input
                                  type="number"
                                  value={manualQty}
                                  onChange={(e) => setManualQty(parseInt(e.target.value, 10) || 1)}
                                  className="w-full px-3 py-2 rounded-xl border border-[#e2d7cb] bg-white text-xs text-[#09131e]"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[#78716c] mb-1">Material</label>
                                <input
                                  type="text"
                                  value={manualMaterial}
                                  onChange={(e) => setManualMaterial(e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl border border-[#e2d7cb] bg-white text-xs text-[#09131e]"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[#78716c] mb-1">Thickness (mm)</label>
                                <input
                                  type="number"
                                  value={manualThickness}
                                  onChange={(e) => setManualThickness(parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 rounded-xl border border-[#e2d7cb] bg-white text-xs text-[#09131e]"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[#78716c] mb-1">Operations</label>
                                <input
                                  type="text"
                                  value={manualOperations}
                                  onChange={(e) => setManualOperations(e.target.value)}
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
                        onClick={handleCreateStep1Submit}
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
                    <button onClick={() => setIsCreatingJob(false)} className="hover:text-[#09131e] transition-colors cursor-pointer">
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

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInputChange}
                      accept=".svg,.dxf"
                      className="hidden"
                    />

                    {uploadError && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <div className="lg:col-span-8 space-y-4">
                        <div
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDropFile}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                            isDragging
                              ? 'border-[#ad7342] bg-[#fbf4eb]'
                              : 'border-[#e2d7cb] bg-[#fdfbf9]/60 hover:bg-[#faf7f4]'
                          }`}
                        >
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
                                <p className="text-[11px] text-[#78716c]">1.2 MB · Verified Local</p>
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
                        onClick={handleProceedToAnalysis}
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
                          {currentJob?.name || 'Preflight Audit'}
                        </h1>
                        <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          {currentJob?.status === 'ready' ? 'Ready' : 'Needs Review'}
                        </span>
                        {currentJob && (
                          <span className="text-xs text-[#78716c] font-mono">
                            Ref: {currentJob.id.slice(0, 10)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-[#57534e]">
                        <div>Client: <span className="font-medium text-[#09131e]">{currentJob?.customerName || 'Direct Customer'}</span></div>
                        <div>Created: <span className="font-medium text-[#09131e]">{currentJob ? new Date(currentJob.createdAt).toLocaleDateString() : 'Today'}</span></div>
                        <div>Machine Profile: <span className="font-medium text-[#09131e]">{machineProfiles.find((p) => p.id === currentJob?.selectedMachineProfileId)?.name || machineProfiles[0]?.name || 'Standard Laser'}</span></div>
                        <div>Version: <span className="font-medium text-[#09131e]">v1</span></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                      <button
                        onClick={handleShareReport}
                        className="border border-[#d8cec2] bg-white hover:bg-[#faf7f3] text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-[#09131e] shadow-sm transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share Report</span>
                      </button>
                      <button
                        onClick={handleExportPdfReport}
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
                            <span className="font-medium text-[#09131e]">{currentSpec?.quantity || 10} pieces</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Size</span>
                            <span className="font-medium text-[#09131e]">{currentSpec?.width || 120} x {currentSpec?.height || 80} mm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Material</span>
                            <span className="font-medium text-[#09131e]">{currentSpec?.material || '3 mm acrylic'}</span>
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
                              {currentJob?.originalInstructions || 'No client notes provided.'}
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
                            <p className="text-xs font-semibold text-[#09131e] truncate">{uploadedFileName}</p>
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
                              <span>{currentFile?.sha256?.slice(0, 10) || '8f3a2e...9c1d'}</span>
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
                            <p className="font-semibold text-red-700">{currentAuditRun?.issueCount ?? 2}</p>
                            <p className="text-[10px] text-red-800">Issues</p>
                          </div>
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                            <p className="font-semibold text-amber-700">{currentAuditRun?.warningCount ?? 3}</p>
                            <p className="text-[10px] text-amber-800">Warnings</p>
                          </div>
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                            <p className="font-semibold text-emerald-700">{currentAuditRun?.passedCount ?? 6}</p>
                            <p className="text-[10px] text-emerald-800">Passed</p>
                          </div>
                          <div className="p-2 rounded-xl bg-stone-100 border border-stone-200">
                            <p className="font-semibold text-stone-700">{currentAuditRun?.unverifiedCount ?? 2}</p>
                            <p className="text-[10px] text-stone-800">Unverified</p>
                          </div>
                        </div>

                        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                          {currentFindings.length > 0 ? (
                            currentFindings.map((fnd) => (
                              <div
                                key={fnd.id}
                                className={`p-3 rounded-xl border flex items-start justify-between gap-2 text-xs ${
                                  fnd.verificationStatus === 'issue'
                                    ? 'bg-red-50/60 border-red-200'
                                    : fnd.verificationStatus === 'warning'
                                    ? 'bg-amber-50/60 border-amber-200'
                                    : fnd.verificationStatus === 'passed'
                                    ? 'bg-emerald-50/50 border-emerald-200'
                                    : 'bg-stone-50 border-stone-200'
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-[#09131e]">{fnd.title}</p>
                                  <p className="text-[11px] text-[#57534e]">{fnd.description}</p>
                                </div>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 uppercase bg-white/70 border border-[#e5dcd3]">
                                  {fnd.severity}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-xs text-[#78716c]">
                              Analysis loaded and verified.
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => alert(`Displaying all ${currentFindings.length} geometry and specification checks.`)}
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
                    <button onClick={() => setIsCreatingJob(false)} className="hover:text-[#09131e] transition-colors cursor-pointer">
                      Jobs
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-[#a8a29e]" />
                    <button onClick={() => setCreateStep(1)} className="hover:text-[#09131e] transition-colors cursor-pointer">
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
                          <button onClick={() => alert('Viewing high-res rendering.')} className="text-xs font-medium text-[#78716c] hover:text-[#09131e] border border-[#d8cec2] px-3 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer bg-white">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Fit to view</span>
                          </button>
                        </div>

                        <div className="rounded-2xl overflow-hidden border border-[#e5dcd3] bg-stone-100 aspect-[16/10]">
                          <img src={activeGalleryImg} alt="Design Preview" className="w-full h-full object-cover transition-all duration-300" />
                        </div>

                        <div className="grid grid-cols-4 gap-3 pt-2">
                          {[dash1Img, h3Img, h4Img, sec2Img].map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveGalleryImg(img)}
                              className={`rounded-xl overflow-hidden border-2 transition-all aspect-video cursor-pointer ${
                                activeGalleryImg === img ? 'border-[#ad7342] shadow-sm' : 'border-[#e5dcd3] hover:border-[#b87d4b]/60 opacity-80 hover:opacity-100'
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
                          <button onClick={() => setCreateStep(1)} className="text-xs font-medium text-[#78716c] hover:text-[#09131e] border border-[#d8cec2] px-2.5 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer bg-white">
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Job Name</span>
                            <span className="font-medium text-[#09131e]">{currentJob?.name || 'Untitled Job'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Client</span>
                            <span className="font-medium text-[#09131e]">{currentJob?.customerName || 'Direct Customer'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Quantity</span>
                            <span className="font-medium text-[#09131e]">{currentSpec?.quantity || 1} pieces</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Due Date</span>
                            <span className="font-medium text-[#09131e]">{currentJob?.dueDate || 'Standard Queue'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/85 rounded-2xl p-5 border border-[#e5dcd3] shadow-sm space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#f0e8de]">
                          <h3 className="text-sm font-semibold text-[#09131e]">File Information</h3>
                          <button onClick={() => setCreateStep(2)} className="text-xs font-medium text-[#78716c] hover:text-[#09131e] border border-[#d8cec2] px-2.5 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer bg-white">
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#faf7f3] border border-[#e5dcd3]">
                          <img src={dash1Img} alt="" className="w-10 h-10 rounded-lg object-cover border border-[#e5dcd3] bg-white p-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-[#09131e]">{uploadedFileName || 'No file selected'}</p>
                            <p className="text-[10px] text-[#78716c]">
                              {currentFile ? `${(currentFile.fileSize / 1024).toFixed(1)} KB · Vector Drawing` : 'Vector Drawing'}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Dimensions</span>
                            <span className="font-medium text-[#09131e]">
                              {currentSpec ? `${currentSpec.width} x ${currentSpec.height} ${currentSpec.units}` : '0 x 0 mm'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#78716c]">Material Thickness</span>
                            <span className="font-medium text-[#09131e]">
                              {currentSpec ? `${currentSpec.thickness} mm` : '0 mm'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/85 rounded-2xl p-5 border border-[#e5dcd3] shadow-sm space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#f0e8de]">
                          <h3 className="text-sm font-semibold text-[#09131e]">Machine Profile</h3>
                          <button onClick={() => setCreateStep(2)} className="text-xs font-medium text-[#78716c] hover:text-[#09131e] border border-[#d8cec2] px-2.5 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer bg-white">
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#faf7f3] border border-[#e5dcd3]">
                          <div className="w-12 h-10 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0 font-mono text-[10px]">
                            LASER
                          </div>
                          {(() => {
                            const prof = machineProfiles.find((p) => p.id === currentJob?.selectedMachineProfileId) || machineProfiles[0]
                            return (
                              <div>
                                <p className="text-xs font-semibold text-[#09131e]">{prof?.name || 'Default Profile'}</p>
                                <p className="text-[10px] text-[#78716c]">Bed Size: {prof?.bedWidth || 0} x {prof?.bedHeight || 0} mm</p>
                                <p className="text-[10px] text-[#78716c]">Max Material Thickness: {prof?.maxThickness || 0} mm</p>
                                <p className="text-[10px] text-[#78716c]">Cutting Method: {prof?.machineType || 'CO2 Laser'}</p>
                              </div>
                            )
                          })()}
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
                          reviewConfirmed ? 'bg-[#ad7342] hover:bg-[#965e31]' : 'bg-[#ad7342]/50 cursor-not-allowed'
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
                  <button onClick={() => setActiveTab('Dashboard')} className="text-xs font-medium text-[#b87d4b] hover:underline cursor-pointer">
                    Back to Dashboard
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center p-8 bg-white/70 rounded-2xl border border-dashed border-[#d8cec2] text-center space-y-3">
                  <p className="text-sm font-medium text-[#09131e]">
                    Audit a new production file against customer instructions
                  </p>
                  <button
                    onClick={handleStartNewJobFlow}
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
                      {jobsList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-xs text-[#78716c]">
                            No jobs created yet. Click "New Job" to begin preflight inspection.
                          </td>
                        </tr>
                      ) :
                        jobsList.map((job) => (
                        <tr key={job.id} className="group hover:bg-[#faf7f3] transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <img src={h2Img} alt="" className="w-9 h-7 rounded-md object-cover border border-[#e5dcd3] bg-stone-100 shrink-0" />
                              <span className="font-medium text-[#09131e]">{job.name}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-[#57534e]">{job.customerName}</td>
                          <td className="py-3 pr-4">
                            {job.status === 'needs_review' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Needs Review</span>
                              </span>
                            )}
                            {job.status === 'ready' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Ready</span>
                              </span>
                            )}
                            {job.status === 'in_progress' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3" />
                                <span>In Progress</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-[#78716c] text-xs">
                            {new Date(job.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleRedoJob(job)}
                                className="p-1.5 rounded-lg text-[#57534e] hover:text-[#09131e] hover:bg-stone-100 transition-colors cursor-pointer"
                                title="Redo Preflight"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
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
          ) : activeTab === 'Machine Profiles' ? (
            <section className="bg-white/85 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#e5dcd3] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#f0e8de]">
                <div>
                  <h2 className="text-xl font-medium text-[#09131e]">Machine Profiles</h2>
                  <p className="text-xs text-[#78716c]">Configured bed dimensions, laser limits, and toolpath conventions</p>
                </div>
                <button onClick={() => setActiveTab('Dashboard')} className="text-xs font-medium text-[#b87d4b] hover:underline cursor-pointer">
                  Back to Dashboard
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {machineProfiles.map((prof) => (
                  <div key={prof.id} className="p-6 rounded-2xl border border-[#e5dcd3] bg-white space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#ad7342]/10 text-[#ad7342] flex items-center justify-center">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-[#09131e]">{prof.name}</h3>
                          <p className="text-xs text-[#78716c]">{prof.machineType}</p>
                        </div>
                      </div>
                      {prof.isDefault && (
                        <span className="text-[10px] font-semibold bg-[#ad7342]/15 text-[#ad7342] px-2.5 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#57534e] pt-2 border-t border-[#f0e8de]">
                      <div>Bed Envelope: <strong className="text-[#09131e]">{prof.bedWidth} x {prof.bedHeight} {prof.units}</strong></div>
                      <div>Max Stock: <strong className="text-[#09131e]">{prof.maxThickness} mm</strong></div>
                      <div>Kerf Width: <strong className="text-[#09131e]">{prof.kerf} mm</strong></div>
                      <div>Default Tolerance: <strong className="text-[#09131e]">{prof.defaultTolerance} mm</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : activeTab === 'Settings' ? (
            <section className="bg-white/85 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#e5dcd3] shadow-sm space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-[#f0e8de]">
                <div>
                  <h2 className="text-xl font-medium text-[#09131e]">Workspace & Model Settings</h2>
                  <p className="text-xs text-[#78716c]">Hardware verification, local storage status, and Gemma model downloads</p>
                </div>
                <button onClick={() => setActiveTab('Dashboard')} className="text-xs font-medium text-[#b87d4b] hover:underline cursor-pointer">
                  Back to Dashboard
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-white border border-[#e5dcd3] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#78716c] uppercase">
                    <Cpu className="w-4 h-4 text-[#ad7342]" />
                    <span>WebGPU Acceleration</span>
                  </div>
                  <p className={`text-lg font-semibold ${capabilities?.webGpu === 'available' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {capabilities?.webGpu === 'available' ? 'Available' : 'Unavailable'}
                  </p>
                  <p className="text-xs text-[#78716c]">
                    {capabilities?.webGpuReason || 'Hardware acceleration detected on this device.'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#e5dcd3] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#78716c] uppercase">
                    <HardDrive className="w-4 h-4 text-[#ad7342]" />
                    <span>Local Storage Quota</span>
                  </div>
                  <p className="text-lg font-semibold text-[#09131e]">
                    {formatBytes(capabilities?.storageEstimate.usage)} used
                  </p>
                  <p className="text-xs text-[#78716c]">
                    of {formatBytes(capabilities?.storageEstimate.quota)} browser allocation.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#e5dcd3] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#78716c] uppercase">
                    <ShieldCheck className="w-4 h-4 text-[#ad7342]" />
                    <span>Storage Persistence</span>
                  </div>
                  <p className="text-lg font-semibold text-[#09131e] capitalize">
                    {capabilities?.persistentStorage || 'Standard'}
                  </p>
                  <p className="text-xs text-[#78716c]">
                    Protected against automatic cache eviction.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-semibold text-[#09131e]">Local Gemma Model Management</h3>

                <div className="space-y-3">
                  {(['gemma-4b', 'gemma-2b'] as const).map((mId) => {
                    const isCached = modelStatus[mId]?.cached
                    const isDownloading = downloadingModelId === mId
                    const name = mId === 'gemma-4b' ? 'Gemma 4B' : 'Gemma 2B'
                    const sizeStr = mId === 'gemma-4b' ? '2.76 GB' : '1.87 GB'

                    return (
                      <div key={mId} className="p-5 rounded-2xl bg-white border border-[#e5dcd3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2.5 mb-1">
                            <h4 className="font-semibold text-sm text-[#09131e]">{name}</h4>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isCached ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {isCached ? 'Cached Locally' : 'Not Downloaded'}
                            </span>
                          </div>
                          <p className="text-xs text-[#57534e]">
                            Direct WebGPU LiteRT-LM build ({sizeStr}) · Apache 2.0 license
                          </p>
                          {isDownloading && downloadProgress && (
                            <div className="mt-2 text-xs font-mono text-[#ad7342]">
                              Downloading: {formatBytes(downloadProgress.receivedBytes)} / {formatBytes(downloadProgress.totalBytes)}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5">
                          {isDownloading ? (
                            <button
                              onClick={handleCancelDownload}
                              className="px-4 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium cursor-pointer"
                            >
                              Cancel
                            </button>
                          ) : isCached ? (
                            <button
                              onClick={() => handleDeleteModel(mId)}
                              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#09131e] text-xs font-medium cursor-pointer"
                            >
                              Delete Model
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDownloadModel(mId)}
                              className="px-5 py-2 rounded-xl bg-[#ad7342] hover:bg-[#965e31] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          ) : activeTab === 'Reports' ? (
            <section className="bg-white/85 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#e5dcd3] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#f0e8de]">
                <div>
                  <h2 className="text-xl font-medium text-[#09131e]">Audit Reports</h2>
                  <p className="text-xs text-[#78716c]">Generated inspection summaries and downloadable preflight logs</p>
                </div>
                <button onClick={() => setActiveTab('Dashboard')} className="text-xs font-medium text-[#b87d4b] hover:underline cursor-pointer">
                  Back to Dashboard
                </button>
              </div>

              <div className="space-y-3">
                {jobsList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#78716c] bg-[#faf7f3] rounded-2xl border border-dashed border-[#e5dcd3]">
                    No audit reports generated yet. Complete a preflight audit to view and export reports.
                  </div>
                ) : (
                  jobsList.map((job) => (
                    <div key={job.id} className="p-4 rounded-2xl bg-white border border-[#e5dcd3] flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-[#09131e]">{job.name}</h4>
                        <p className="text-xs text-[#78716c]">Client: {job.customerName} · Last audited: {new Date(job.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            const bundle = await jobService.getFullReportBundle(job.id)
                            const html = generateHtmlReport(bundle)
                            triggerDownload(html, `${job.name}-report.html`, 'text/html')
                          }}
                          className="px-3.5 py-1.5 rounded-xl border border-[#d8cec2] bg-white text-xs font-medium text-[#09131e] hover:bg-[#faf7f3] flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>HTML Report</span>
                        </button>
                        <button
                          onClick={async () => {
                            const bundle = await jobService.getFullReportBundle(job.id)
                            const json = generateJsonReport(bundle)
                            triggerDownload(json, `${job.name}-report.json`, 'application/json')
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#071827] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>JSON Data</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white/85 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-[#e5dcd3] shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 text-[#b87d4b] bg-[#c28b55]/15">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-xl font-semibold text-[#09131e] leading-tight mb-0.5">{stats.total}</p>
                      <p className="text-[11px] sm:text-xs text-[#78716c] leading-tight">Total Jobs</p>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                    Active
                  </span>
                </div>

                <div className="bg-white/85 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-[#e5dcd3] shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 text-emerald-600 bg-emerald-50">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-xl font-semibold text-[#09131e] leading-tight mb-0.5">{stats.ready}</p>
                      <p className="text-[11px] sm:text-xs text-[#78716c] leading-tight">Ready for Production</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/85 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-[#e5dcd3] shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 text-amber-600 bg-amber-50">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-xl font-semibold text-[#09131e] leading-tight mb-0.5">{stats.needsReview}</p>
                      <p className="text-[11px] sm:text-xs text-[#78716c] leading-tight">Need Review</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/85 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-[#e5dcd3] shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 text-[#6b7280] bg-stone-100">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-xl font-semibold text-[#09131e] leading-tight mb-0.5">{stats.inProgress}</p>
                      <p className="text-[11px] sm:text-xs text-[#78716c] leading-tight">In Progress</p>
                    </div>
                  </div>
                </div>
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
                      {jobsList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-xs text-[#78716c]">
                            No recent jobs found. Click "Create New Job" to begin.
                          </td>
                        </tr>
                      ) :
                        jobsList.slice(0, 5).map((job) => (
                        <tr key={job.id} className="group hover:bg-[#faf7f3] transition-colors">
                          <td className="py-2.5 pr-4">
                            <div className="flex items-center gap-3">
                              <img src={h2Img} alt="" className="w-9 h-7 rounded-md object-cover border border-[#e5dcd3] bg-stone-100 shrink-0" />
                              <span className="font-medium text-[#09131e]">{job.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-4 text-[#57534e] hidden sm:table-cell text-xs sm:text-sm">
                            {job.customerName}
                          </td>
                          <td className="py-2.5 pr-4">
                            {job.status === 'needs_review' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Needs Review</span>
                              </span>
                            )}
                            {job.status === 'ready' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Ready</span>
                              </span>
                            )}
                            {job.status === 'in_progress' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3" />
                                <span>In Progress</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 pr-4 text-[#78716c] text-xs hidden md:table-cell">
                            {new Date(job.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                <div className="fixed inset-0 z-20" onClick={() => setOpenActionMenuId(null)} />
                                <div className="absolute right-0 top-full mt-1 w-28 bg-white rounded-xl border border-[#e5dcd3] shadow-lg p-1 z-30 space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100">
                                  <button
                                    onClick={() => {
                                      setOpenActionMenuId(null)
                                      handleRedoJob(job)
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#09131e] hover:bg-[#faf7f3] transition-colors cursor-pointer"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5 text-[#b87d4b]" />
                                    <span>Redo</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setOpenActionMenuId(null)
                                      handleDeleteJob(job.id)
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
