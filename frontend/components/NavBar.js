'use client'
import Link from "next/link"
import { useTheme } from 'next-themes'
import {FaMoon, FaSun} from 'react-icons/fa'
import { useEffect, useState } from "react"
import { FaCube} from 'react-icons/fa'

const NavBar = ({currentPage, textColor}) => {
    let style = "hover:bg-gray-200 cursor-pointer mr-4 p-3 rounded-md border border-primary"
    const {theme, setTheme} = useTheme()
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {setMounted(true)}, [])

  return (
    <div className="fixed top-0 left-0 w-full bg-secondary border-b-1 border-secondary z-50 py-2">
        <div className="flex flex-row justify-between items-center mx-5">
            <div className="flex flex-row items-center gap-1">
                <Link href={'/'} className="cursor-pointer flex flex-row items-center" >
                    <FaCube className="text-white text-5xl rounded-lg p-3" style={{backgroundColor: `var(${textColor})`}} /> 
                    <p className={`text-2xl rounded p-2`}>SMASH /</p>
                </Link>
                <p style={{color: `var(${textColor})`}} className={`text-lg`}>{currentPage} </p>
            </div>
            <div className={`flex flex-row gap-2 items-center justify-center`}>
                <button
                    className={`p-3 rounded-full border-1 hover:rotate-180 transition-transform duration-500 cursor-pointer`}
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    {mounted && (theme === "dark" ? <FaSun /> : <FaMoon />)}
                </button>
          </div>
        </div>

    </div>
  )
}

export default NavBar
{/* {currentPage != "Preview" ?
                <Link href={'/video_library/'} className={style} >
                    Preview Pillar
                </Link> : null}
                {currentPage != "Analysis" ?
                <Link href={'/analysis/'} className={style} >
                    Analysis Pillar
                </Link> : null}
                {currentPage != "Analytics" ?
                <Link href={'/analytics/'} className={style} >
                    Analytics Pillar
                </Link> : null} */}