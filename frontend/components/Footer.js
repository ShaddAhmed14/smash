import { FaGithub } from 'react-icons/fa'
import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="w-full border-t border-[color:var(--border-primary)] bg-[color:var(--bg-secondary)]">
      <div className="flex flex-col sm:flex-row justify-between items-center w-full px-6 md:px-10 py-4 gap-3">
        <p className="carbon-label-01 text-[color:var(--text-tertiary)]">
          &copy; {new Date().getFullYear()} SMASH &middot; Radboud University
        </p>
        <div className="flex flex-row items-center gap-6">
          <Link href="https://github.com/ReSurfEMG/smash" className="carbon-label-01 flex items-center gap-1.5 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] no-underline transition-colors duration-150">
            <FaGithub aria-hidden="true" /> GitHub
          </Link>
          <Link href="https://www.ru.nl/" className="carbon-label-01 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] no-underline transition-colors duration-150">
            Radboud University
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
