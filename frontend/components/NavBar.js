'use client'
import Link from "next/link"
import { useTheme } from 'next-themes'
import {FaMoon, FaSun} from 'react-icons/fa'
import { useEffect, useState } from "react"
import { FaCube} from 'react-icons/fa'

const NavBar = ({currentPage, textColor}) => {
    let style = "hover:bg-gray-200 cursor-pointer mr-4 p-3 border-primary"
    const {theme, setTheme} = useTheme()
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {setMounted(true)}, [])

  return (
    <div className="fixed top-0 left-0 w-full bg-secondary border-b h-12 border-primary z-50 flex flex-row justify-between items-center py-0 px-6">
        <Link href={'/'} className="flex flex-row items-center gap-3">
            <svg className="w-7 h-7" viewBox="0 0 100 100">
                <path d="M50 20 L20 38 L20 72 L50 90 Z" fill="#E05A7A"/>
                <path d="M28 55 Q34 45, 40 55 Q46 65, 50 55" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path d="M50 20 L80 38 L80 72 L50 90 Z" fill="#FFC166"/>
                <circle cx="65" cy="55" r="8" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3"/>
                <circle cx="65" cy="55" r="3" fill="rgba(255,255,255,0.5)"/>
                <path d="M50 20 L80 38 L50 55 L20 38 Z" fill="#3ddbd9"/>
                <path d="M35 40 Q50 30, 65 40" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <circle cx="65" cy="40" r="3" fill="rgba(255,255,255,0.5)"/>
            </svg>
            <span className="font-semibold text-[1rem]">SMASH</span>
            {currentPage != "Landing" && <span>/</span>}
            {currentPage != "Landing" && <span style={{color: `var(${textColor})`}}>{currentPage}</span>}
        </Link>
        <div className={`flex flex-row gap-4 items-center justify-center`}>
            {currentPage == "Landing" && <a className="text-secondary hover:text-primary no-underline text-[0.875rem]" href="#">Documentation</a>}
            {currentPage == "Landing" && <a className="text-secondary hover:text-primary no-underline text-[0.875rem]" href="#">About</a>}
            {currentPage != "Landing" && currentPage != "Preview" && <Link href={'/video_library'} className="text-secondary hover:text-primary no-underline text-[0.875rem]">Preview</Link>}
            {currentPage != "Landing" && currentPage != "Analysis" && <Link href={'/analysis'} className="text-secondary hover:text-primary no-underline text-[0.875rem]">Analysis</Link>}
            {currentPage != "Landing" && currentPage != "Analytics" && <Link href={'/analytics'} className="text-secondary hover:text-primary no-underline text-[0.875rem]">Analytics</Link>}
            <button
                className={`w-10 h-10 bg-none border-none text-[1.25rem] cursor-pointer`}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
                {mounted && (theme === "dark" ? "☀️" : "🌙")}
            </button>
        </div>
    </div>
  )
}

export default NavBar
