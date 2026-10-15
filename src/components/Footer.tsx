import { Link } from 'react-router'
import logoImg from '../assets/logo.webp'

export default function Footer() {
  return (
    <footer className="bg-[#faf8f5] border-t border-[#e8dfd5]/80 py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 group focus:outline-none">
          <img
            src={logoImg}
            alt="Tolerix"
            className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        <div className="flex items-center gap-8 sm:gap-10">
          <Link
            to="/how-it-works"
            className="text-sm font-medium text-[#4b5563] hover:text-[#09131e] transition-colors"
          >
            How It Works
          </Link>
          <Link
            to="/documentation"
            className="text-sm font-medium text-[#4b5563] hover:text-[#09131e] transition-colors"
          >
            Documentation
          </Link>
          <Link
            to="/privacy"
            className="text-sm font-medium text-[#4b5563] hover:text-[#09131e] transition-colors"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  )
}
