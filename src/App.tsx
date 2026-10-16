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
import dash1Img from './assets/dash1.webp'

const allAssets = [
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
  d2Img,
  dash1Img
]

const routeAssets: Record<string, string[]> = {
  '/': [logoImg, heroImg, sec2Img, sec3Img, sec4Img],
  '/how-it-works': [logoImg, h1Img, h2Img, h3Img, h4Img, h5Img, sec4Img],
  '/documentation': [logoImg, d1Img, sec4Img],
  '/privacy': [logoImg, sec4Img, d2Img],
  '/dashboard': [logoImg, dash1Img, h2Img, sec2Img]
}

function loadAsset(src: string): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>()
  const img = new Image()
  img.src = src

  const onDone = () => {
    if ('decode' in img && typeof img.decode === 'function') {
      img.decode().then(() => resolve()).catch(() => resolve())
    } else {
      resolve()
    }
  }

  if (img.complete && img.naturalWidth !== 0) {
    onDone()
  } else {
    img.onload = onDone
    img.onerror = () => resolve()
  }

  return promise
}

function delay(ms: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>()
  setTimeout(resolve, ms)
  return promise
}

function PageTransitionManager({ lenisRef }: { lenisRef: React.RefObject<Lenis | null> }) {
  const { pathname } = useLocation()
  const [prevPath, setPrevPath] = useState(pathname)
  const [loading, setLoading] = useState(true)
  const [fading, setFading] = useState(false)
  const isInitialMount = useRef(true)

  if (pathname !== prevPath) {
    setPrevPath(pathname)
    setLoading(true)
    setFading(false)
  }

  useEffect(() => {
    let isMounted = true

    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })
    }
    window.scrollTo(0, 0)
    const assetsToLoad = isInitialMount.current
      ? allAssets
      : (routeAssets[pathname] || [logoImg])

    if (isInitialMount.current) {
      isInitialMount.current = false
    }

    const minDelay = delay(350)
    const loadPromise = Promise.all(assetsToLoad.map(loadAsset))

    Promise.all([loadPromise, minDelay]).then(() => {
      if (!isMounted) return
      setFading(true)
      setTimeout(() => {
        if (!isMounted) return
        setLoading(false)
      }, 300)
    })

    return () => {
      isMounted = false
    }
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
