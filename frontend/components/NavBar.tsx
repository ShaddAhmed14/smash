'use client';

import Link from "next/link";
import { useTheme } from 'next-themes';
import { useEffect, useState } from "react";
import { Asleep, Light } from '@carbon/icons-react';

interface NavBarProps {
  currentPage: string;
  textColor?: string;
}

const NavBar = ({ currentPage, textColor }: NavBarProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-12 bg-secondary border-b border-primary flex items-center justify-between px-6 z-50">
      {/* Left side - Logo */}
      <Link href="/" className="flex items-center gap-3">
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
        <span className="font-semibold">SMASH</span>
        {currentPage !== "Landing" && (
          <>
            <span className="text-tertiary">/</span>
            <span className="text-secondary">{currentPage}</span>
          </>
        )}
      </Link>

      {/* Right side - Navigation + Theme Toggle */}
      <nav className="flex items-center gap-4">
        {currentPage === "Landing" && (
          <>
            <Link href="#" className="text-sm text-secondary hover:text-primary">
              Documentation
            </Link>
            <Link href="#" className="text-sm text-secondary hover:text-primary">
              About
            </Link>
          </>
        )}

        {currentPage !== "Landing" && (
          <>
            {currentPage !== "Preview" && (
              <Link href="/video_library" className="text-sm text-secondary hover:text-primary">
                Preview
              </Link>
            )}
            {currentPage !== "Analysis" && (
              <Link href="/analysis" className="text-sm text-secondary hover:text-primary">
                Analysis
              </Link>
            )}
            {currentPage !== "Analytics" && (
              <Link href="/analytics" className="text-sm text-secondary hover:text-primary">
                Analytics
              </Link>
            )}
          </>
        )}

        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center hover:bg-[#353535] rounded"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted && (theme === "dark" ? <Light size={20} /> : <Asleep size={20} />)}
        </button>
      </nav>
    </header>
  );
};

export default NavBar;
