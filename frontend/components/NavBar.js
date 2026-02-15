'use client'
import Link from "next/link"
import { useTheme } from 'next-themes'
import { useEffect, useState } from "react"

const NavBar = ({currentPage, textColor}) => {
    const {theme, setTheme} = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {setMounted(true)}, [])

  return (
    <nav className="fixed top-0 left-0 w-full nav-frosted border-b border-[color:var(--border-primary)] h-12 z-50 flex flex-row justify-between items-center px-4 md:px-6" role="navigation" aria-label="Main navigation">
        <Link href={'/'} className="flex flex-row items-center gap-3 no-underline">
            <svg className="w-7 h-7" viewBox="0 0 100 100" aria-hidden="true">
                <path d="M50 20 L20 38 L20 72 L50 90 Z" fill="#E05A7A"/>
                <path d="M28 55 Q34 45, 40 55 Q46 65, 50 55" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path d="M50 20 L80 38 L80 72 L50 90 Z" fill="#FFC166"/>
                <circle cx="65" cy="55" r="8" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3"/>
                <circle cx="65" cy="55" r="3" fill="rgba(255,255,255,0.5)"/>
                <path d="M50 20 L80 38 L50 55 L20 38 Z" fill="#3ddbd9"/>
                <path d="M35 40 Q50 30, 65 40" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <circle cx="65" cy="40" r="3" fill="rgba(255,255,255,0.5)"/>
            </svg>
            <span className="font-semibold text-[color:var(--text-primary)] carbon-body-01">SMASH</span>
            {currentPage !== "Landing" && (
                <>
                    <span className="text-[color:var(--border-secondary)]">/</span>
                    <span className="carbon-body-01" style={{color: `var(${textColor})`}}>{currentPage}</span>
                </>
            )}
        </Link>
        <div className="flex flex-row gap-1 items-center">
            {currentPage !== "Landing" && currentPage !== "Preview" && (
                <Link href="/video_library" className="carbon-body-01 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--bg-tertiary)] no-underline px-3 py-2 transition-colors duration-150">Preview</Link>
            )}
            {currentPage !== "Landing" && currentPage !== "Analysis" && (
                <Link href="/analysis" className="carbon-body-01 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--bg-tertiary)] no-underline px-3 py-2 transition-colors duration-150">Analysis</Link>
            )}
            {currentPage !== "Landing" && currentPage !== "Analytics" && (
                <Link href="/analytics" className="carbon-body-01 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--bg-tertiary)] no-underline px-3 py-2 transition-colors duration-150">Analytics</Link>
            )}
            <div className="w-px h-6 bg-[color:var(--border-primary)] mx-2" aria-hidden="true" />
            <button
                className="w-10 h-10 flex items-center justify-center bg-transparent border-none text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)] cursor-pointer transition-colors duration-150"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
                {mounted && (theme === "dark" ? "☀️" : "🌙")}
            </button>
        </div>
    </nav>
  )
}

export default NavBar
