import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import h1Img from '../assets/h1.webp'
import h2Img from '../assets/h2.webp'
import h3Img from '../assets/h3.webp'
import h4Img from '../assets/h4.webp'
import h5Img from '../assets/h5.webp'
import sec4Img from '../assets/4.webp'

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Upload your design',
      desc: 'Add your file and specify material, thickness and cut settings.',
      img: h2Img,
      alt: 'Vector artwork prepared on laptop workstation',
      imageOnLeft: true
    },
    {
      num: '02',
      title: 'We run precision checks',
      desc: 'Tolerix analyzes your design for dimensions, clearances and common manufacturing issues.',
      img: h3Img,
      alt: 'Laser cut wooden corner geometry check',
      imageOnLeft: false
    },
    {
      num: '03',
      title: 'Get recommended fixes',
      desc: 'Receive actionable suggestions to ensure a clean and accurate cut.',
      img: h4Img,
      alt: 'Stacked sheet materials in workshop',
      imageOnLeft: true
    },
    {
      num: '04',
      title: 'Cut with confidence',
      desc: 'Use the validated design for production and get consistent, reliable results.',
      img: h5Img,
      alt: 'Finished intricate wooden laser cut framed piece',
      imageOnLeft: false
    }
  ]

  return (
    <div className="min-h-screen bg-[#f5ede4] text-[#111827] font-sans antialiased overflow-x-hidden selection:bg-[#c28b55]/20 selection:text-[#09131e]">
      <Header />

      <main>
        <section
          id="hero"
          className="relative min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex items-center bg-cover bg-[position:85%_center] sm:bg-[position:80%_center] lg:bg-center bg-no-repeat pt-24 sm:pt-28"
          style={{ backgroundImage: `url(${h1Img})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#f5ede4]/90 via-[#f5ede4]/60 via-45% to-transparent pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 w-full">
            <div className="max-w-xl lg:max-w-2xl">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.22em] text-[#b87d4b] uppercase mb-4 sm:mb-5">
                HOW IT WORKS
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#09131e] leading-[1.08] mb-6">
                From design
                <br />
                to a perfect cut.
              </h1>

              <p className="text-base sm:text-lg text-[#57534e] max-w-lg leading-relaxed">
                A simple flow to check, refine and cut with confidence.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28 lg:py-36 bg-[#f5ede4]">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="relative">
              <div className="hidden lg:block absolute left-1/2 top-10 bottom-10 w-px -translate-x-1/2 bg-[#e2d7cc]" />

              <div className="space-y-16 sm:space-y-24 lg:space-y-32">
                {steps.map((step) => {
                  return (
                    <div
                      key={step.num}
                      className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center"
                    >
                      <div
                        className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#b87d4b] ring-4 ring-[#f5ede4] z-10"
                        aria-hidden="true"
                      />

                      {step.imageOnLeft ? (
                        <>
                          <div className="order-2 lg:order-1">
                            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-[#e5dcd3] bg-white/40 aspect-[16/10]">
                              <img
                                src={step.img}
                                alt={step.alt}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                                loading="lazy"
                              />
                            </div>
                          </div>

                            <div className="order-1 lg:order-2 lg:pl-6">
                              <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#b87d4b] mb-2 font-mono block">
                                {step.num}
                              </span>
                              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-[#09131e] tracking-tight mb-3 sm:mb-4">
                                {step.title}
                              </h2>
                              <p className="text-sm sm:text-base text-[#57534e] leading-relaxed max-w-md">
                                {step.desc}
                              </p>
                            </div>
                        </>
                      ) : (
                        <>
                          <div className="order-1 lg:pr-6">
                            <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#b87d4b] mb-2 font-mono block">
                              {step.num}
                            </span>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-[#09131e] tracking-tight mb-3 sm:mb-4">
                              {step.title}
                            </h2>
                            <p className="text-sm sm:text-base text-[#57534e] leading-relaxed max-w-md">
                              {step.desc}
                            </p>
                          </div>

                          <div className="order-2">
                            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-[#e5dcd3] bg-white/40 aspect-[16/10]">
                              <img
                                src={step.img}
                                alt={step.alt}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          className="relative min-h-[420px] sm:min-h-[480px] flex items-center justify-center bg-cover bg-center bg-no-repeat py-24 sm:py-32"
          style={{ backgroundImage: `url(${sec4Img})` }}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.22em] text-[#b87d4b] uppercase mb-4 sm:mb-5">
              READY TO GET STARTED?
            </p>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#09131e] mb-8 sm:mb-10">
              Check your first design today.
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
