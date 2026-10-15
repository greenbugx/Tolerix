import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Search, FileText, Box, CheckCircle2 } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import d1Img from '../assets/d1.webp'
import d2Img from '../assets/d2.webp'
import sec4Img from '../assets/4.webp'

export default function Documentation() {
  const [activeItem, setActiveItem] = useState('Introduction')
  const [searchQuery, setSearchQuery] = useState('')

  const navCategories = [
    {
      title: 'GET STARTED',
      items: ['Introduction', 'Quick start', 'Supported files', 'System requirements']
    },
    {
      title: 'GUIDES',
      items: [
        'Preparing your design',
        'Material settings',
        'Precision checks',
        'Recommended fixes',
        'Path optimization',
        'Export for cutting'
      ]
    },
    {
      title: 'REFERENCE',
      items: ['File formats', 'Design rules', 'Limits & specifications', 'Troubleshooting']
    },
    {
      title: 'RESOURCES',
      items: ['FAQ', 'Tips & best practices', 'Workshops', 'Contact']
    }
  ]

  const featureCards = [
    {
      icon: FileText,
      title: 'Validate designs',
      desc: 'Catch issues early with automated checks.'
    },
    {
      icon: Box,
      title: 'Optimize for cutting',
      desc: 'Get material-aware recommendations.'
    },
    {
      icon: CheckCircle2,
      title: 'Export with confidence',
      desc: 'Generate cut-ready files that work in the real world.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#f5ede4] text-[#111827] font-sans antialiased overflow-x-hidden selection:bg-[#c28b55]/20 selection:text-[#09131e]">
      <Header />

      <main>
        <section
          id="hero"
          className="relative min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] flex items-center bg-cover bg-[position:80%_center] sm:bg-[position:75%_center] lg:bg-center bg-no-repeat pt-24 sm:pt-28"
          style={{ backgroundImage: `url(${d1Img})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#f5ede4]/92 via-[#f5ede4]/65 via-45% to-transparent pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 w-full">
            <div className="max-w-xl lg:max-w-2xl">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.22em] text-[#b87d4b] uppercase mb-4 sm:mb-5">
                DOCUMENTATION
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#09131e] leading-[1.08] mb-6">
                Everything you
                <br />
                need to get started.
              </h1>

              <p className="text-base sm:text-lg text-[#57534e] max-w-lg leading-relaxed mb-8">
                Guides, references and examples to help you get the most out of Tolerix - from your first design to flawless cuts.
              </p>

              <div>
                <Link
                  to="/dashboard"
                  className="rounded-full bg-[#071827] text-white text-sm font-medium px-6 py-2.5 sm:px-7 sm:py-3 hover:bg-[#0d2a45] transition-all duration-200 inline-flex items-center gap-2 shadow-sm hover:shadow active:scale-95 cursor-pointer"
                >
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-[#f5ede4]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#78716c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documentation..."
                    className="w-full rounded-xl border border-[#e2d7cb] bg-[#faf7f3] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-[#c28b55]/40 transition-all"
                  />
                </div>

                <div className="space-y-6">
                  {navCategories.map((cat) => (
                    <div key={cat.title}>
                      <p className="text-xs font-semibold tracking-wider text-[#b87d4b] uppercase mb-2.5 px-3">
                        {cat.title}
                      </p>
                      <div className="space-y-0.5">
                        {cat.items
                          .filter((item) =>
                            item.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((item) => {
                            const isActive = activeItem === item
                            return (
                              <button
                                key={item}
                                onClick={() => setActiveItem(item)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-between ${
                                  isActive
                                    ? 'bg-[#ede2d6] text-[#09131e] font-medium border-l-2 border-[#b87d4b]'
                                    : 'text-[#57534e] hover:text-[#09131e] hover:bg-[#ede2d6]/40'
                                }`}
                              >
                                <span>{item}</span>
                              </button>
                            )
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              <div className="lg:col-span-8 xl:col-span-9 bg-transparent">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-[#b87d4b] uppercase mb-2">
                    GET STARTED
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#09131e] mb-4">
                    {activeItem}
                  </h2>
                  <p className="text-sm sm:text-base text-[#57534e] leading-relaxed max-w-3xl mb-8">
                    Tolerix helps you prepare, check and optimize your designs for laser cutting with precision. This documentation will guide you through everything you need - from setting up to exporting a flawless cut file.
                  </p>

                  <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-[#e5dcd3] bg-white/40 mb-10 aspect-[16/9]">
                    <img
                      src={d2Img}
                      alt="Workshop drawing and laser cut workpiece"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.01]"
                      loading="lazy"
                    />
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl sm:text-2xl font-medium text-[#09131e] mb-2">
                      What you can do with Tolerix
                    </h3>
                    <p className="text-sm sm:text-base text-[#57534e] leading-relaxed max-w-2xl mb-8">
                      From simple tags to intricate art pieces, Tolerix gives you the tools to turn ideas into clean, consistent cuts.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {featureCards.map((card) => {
                        const Icon = card.icon
                        return (
                          <div
                            key={card.title}
                            className="bg-transparent space-y-3"
                          >
                            <div className="w-10 h-10 rounded-xl bg-[#c28b55]/15 flex items-center justify-center text-[#b87d4b]">
                              <Icon className="w-5 h-5" />
                            </div>
                            <h4 className="text-base font-medium text-[#09131e]">
                              {card.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-[#78716c] leading-relaxed">
                              {card.desc}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="relative min-h-[400px] sm:min-h-[440px] flex items-center justify-center bg-cover bg-center bg-no-repeat py-20 sm:py-28"
          style={{ backgroundImage: `url(${sec4Img})` }}
        >
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.22em] text-[#b87d4b] uppercase mb-4">
              STILL HAVE QUESTIONS?
            </p>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#09131e] mb-4">
              We're here to help.
            </h2>

            <p className="text-sm sm:text-base text-[#57534e] max-w-xl mx-auto mb-8 leading-relaxed">
              Check out the FAQ or reach out if you need any assistance with your designs or cutting workflow.
            </p>

            <div>
              <button
                onClick={() => alert('Support available at support@tolerix.com')}
                className="rounded-full bg-[#071827] text-white text-sm sm:text-base font-medium px-7 sm:px-8 py-3.5 hover:bg-[#0d2a45] transition-all duration-200 inline-flex items-center gap-2.5 shadow-sm hover:shadow active:scale-95 cursor-pointer"
              >
                <span>Contact us</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
