import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router'
import Lenis from 'lenis'
import Home from './pages/Home'
import HowItWorks from './pages/HowItWorks'
import Documentation from './pages/Documentation'
import Privacy from './pages/Privacy'
import Dashboard from './pages/Dashboard'

function ScrollToTop({ lenisRef }: { lenisRef: React.RefObject<Lenis | null> }) {
  const { pathname } = useLocation()

  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })
    }
    window.scrollTo(0, 0)
  }, [pathname, lenisRef])

  return null
}

export default function App() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
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
      <ScrollToTop lenisRef={lenisRef} />
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
