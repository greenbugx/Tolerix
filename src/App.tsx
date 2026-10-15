import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router'
import Lenis from 'lenis'
import Home from './pages/Home'
import HowItWorks from './pages/HowItWorks'
import Documentation from './pages/Documentation'
import Privacy from './pages/Privacy'
import Dashboard from './pages/Dashboard'
import logoImg from './assets/logo.webp'
import heroImg from './assets/hero.webp'
import sec2Img from './assets/2.webp'
import sec3Img from './assets/3.webp'
import sec4Img from './assets/4.webp'
import h1Img from './assets/h1.webp'
import h2Img from './assets/h2.webp'
import h3Img from './assets/h3.webp'
import h4Img from './assets/h4.webp'
import h5Img from './assets/h5.webp'
import d1Img from './assets/d1.webp'
import d2Img from './assets/d2.webp'

function PageTransitionManager({ lenisRef }: { lenisRef: React.RefObject<Lenis | null> }) {
  const { pathname } = useLocation()
  const [loading, setLoading] = useState(true)
  const [fading, setFading] = useState(false)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })
    }
    window.scrollTo(0, 0)

    if (isInitialMount.current) {
      isInitialMount.current = false
      const timer = setTimeout(() => {
        setFading(true)
        setTimeout(() => setLoading(false), 300)
      }, 700)
      return () => clearTimeout(timer)
    }

    setLoading(true)
    setFading(false)

    const timer = setTimeout(() => {
      setFading(true)
      setTimeout(() => setLoading(false), 300)
    }, 450)

    return () => clearTimeout(timer)
  }, [pathname, lenisRef])

  if (!loading) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f5ede4] transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center">
        <img
          src={logoImg}
          alt="Tolerix"
          className="h-10 sm:h-12 w-auto object-contain mb-8 animate-pulse"
        />
        <div className="w-8 h-8 rounded-full border-2 border-[#e5dcd3] border-t-[#b87d4b] animate-spin" />
      </div>
    </div>
  )
}

export default function App() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const images = [
      logoImg,
      heroImg,
      sec2Img,
      sec3Img,
      sec4Img,
      h1Img,
      h2Img,
      h3Img,
      h4Img,
      h5Img,
      d1Img,
      d2Img
    ]
    images.forEach((src) => {
      const img = new Image()
      img.src = src
    })

    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
    })
    lenisRef.current = lenis

    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return (
    <BrowserRouter>
      <PageTransitionManager lenisRef={lenisRef} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
