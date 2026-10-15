import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import heroImg from '../assets/hero.webp'
import sec2Img from '../assets/2.webp'
import sec3Img from '../assets/3.webp'
import sec4Img from '../assets/4.webp'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5ede4] text-[#111827] font-sans antialiased overflow-x-hidden selection:bg-[#c28b55]/20 selection:text-[#09131e]">
      <Header />

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
                <Link
                  to="/dashboard"
                  className="rounded-full bg-[#071827] text-white text-sm sm:text-base font-medium px-6 sm:px-7 py-3 hover:bg-[#0d2a45] transition-all duration-200 inline-flex items-center gap-2.5 shadow-sm hover:shadow active:scale-95 cursor-pointer"
                >
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
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
              <Link
                to="/dashboard"
                className="rounded-full bg-[#071827] text-white text-sm sm:text-base font-medium px-7 sm:px-8 py-3.5 hover:bg-[#0d2a45] transition-all duration-200 inline-flex items-center gap-2.5 shadow-sm hover:shadow active:scale-95 cursor-pointer"
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
