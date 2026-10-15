import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Privacy() {
  const sections = [
    {
      title: 'What We Collect',
      content:
        'Tolerix does not collect any personal data, business information, or telemetry. The application is built to run locally on your workstation without user tracking, telemetry trackers, advertising pixels, or analytics cookies.'
    },
    {
      title: 'What We Do Not Collect',
      content:
        'Your manufacturing intellectual property belongs entirely to you. We do not collect, transmit, or store: customer messages, order descriptions, dimensions, quantities, raw vector artwork, SVG paths, layer structures, or machine profile parameters. Nothing you upload or paste into Tolerix is sent to our servers or third parties.'
    },
    {
      title: 'Local-First Architecture and Data Custody',
      content:
        'All geometry parsing, bounding box calculations, unit conversions, and order comparisons execute strictly on your computer. Files remain on your local filesystem, and temporary records are stored in your private local SQLite database on your workstation.'
    },
    {
      title: 'SVG Untrusted Input Sanitization',
      content:
        'Vector files from external customers are treated as untrusted data. The parser strictly rejects active JavaScript, external entity declarations, and foreign resource requests, protecting your workshop computer from malicious embedded content.'
    },
    {
      title: 'AI Interpretation Privacy',
      content:
        'Gemma operates within your configured local runtime environment. Customer requirements processed by the model are never sent to external AI providers, logged into external monitoring platforms, or used to train commercial language models.'
    },
    {
      title: 'Data Deletion and Retention',
      content:
        'You have absolute control over all stored data. When you delete a job, Tolerix purges the associated vector file, extracted specification records, and audit findings from your workstation permanently.'
    },
    {
      title: 'Offline Independence',
      content:
        'Tolerix does not mandate continuous internet access. Once the local application, dependencies, and model weights are installed, you can operate entirely offline in an air-gapped workshop environment.'
    },
    {
      title: 'Preflight Verification Disclaimer',
      content:
        'Tolerix provides discrepancy detection between customer instructions and production files. The preflight audit report is an evidence tool for operators and does not constitute a legal certification or physical guarantee of machine safety, material behavior, or toolpath accuracy.'
    },
    {
      title: 'Contact and Security Questions',
      content:
        'If you have questions regarding local workstation security, data privacy, or workshop deployment practices, reach out to the Tolerix team at support@tolerix.com.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#f5ede4] text-[#111827] font-sans antialiased overflow-x-hidden selection:bg-[#c28b55]/20 selection:text-[#09131e]">
      <Header />

      <main className="pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.22em] text-[#b87d4b] uppercase mb-4">
              PRIVACY & DATA TERMS
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#09131e] leading-[1.08] mb-6">
              Privacy Policy
            </h1>
            <p className="text-base sm:text-lg text-[#57534e] leading-relaxed">
              Tolerix operates on a strict local-first model. We do not collect, harvest, track, or share your manufacturing designs, customer messages, or production parameters.
            </p>
          </div>

          <div className="space-y-12 sm:space-y-14">
            {sections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#09131e]">
                  {section.title}
                </h2>
                <p className="text-base sm:text-lg text-[#57534e] leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
