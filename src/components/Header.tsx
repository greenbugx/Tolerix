import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import logoImg from '../assets/logo.webp'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#f5ede4]/90 backdrop-blur-md shadow-sm border-b border-[#e5dcd3]/60 h-20'
          : 'bg-transparent h-24'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group focus:outline-none">
          <img
            src={logoImg}
            alt="Tolerix"
            className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>
      </div>
    </header>
  )
}
