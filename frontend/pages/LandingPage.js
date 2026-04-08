'use client'
import { useState } from 'react'
import NavBar from '@/components/NavBar'
import Link from 'next/link'
import Footer from '@/components/Footer'

const MODULES = {
  preview: {
    step: 'Module 1',
    title: 'Preview',
    color: '#E05A7A',
    textColor: '#ffffff',
    href: '/video_library',
    description: 'Upload and preview audiovisual recordings. Prepare source material with automatic transcription, waveform visualization, and speaker diarization.',
    glow: 'var(--glow-preview)',
  },
  analysis: {
    step: 'Module 2',
    title: 'Analysis',
    color: '#3ddbd9',
    textColor: '#161616',
    href: '/analysis',
    description: 'Explore corpus-level patterns through audio features, spectrograms, topic modeling, and cross-video kinematic comparison.',
    glow: 'var(--glow-analysis)',
  },
  analytics: {
    step: 'Module 3',
    title: 'Analytics',
    color: '#FFC166',
    textColor: '#161616',
    href: '/analytics',
    description: 'Dive into per-video NLP analytics — dependency parsing, named entities, semantic networks, and gesture–speech alignment.',
    glow: 'var(--glow-analytics)',
  },
}

const LandingPage = () => {
  const [active, setActive] = useState('preview')
  const info = MODULES[active]

  return (
    <>
      <NavBar currentPage="Landing" textColor={'--custom-preview-dark'} />

      <main className="flex flex-col min-h-screen pt-12 relative overflow-hidden">
        {/* Ambient gradient orbs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] rounded-full opacity-[0.07] dark:opacity-[0.12]"
            style={{ background: '#E05A7A', filter: 'blur(120px)', animation: 'float 20s ease-in-out infinite' }} />
          <div className="absolute -bottom-[10%] -left-[5%] w-[500px] h-[500px] rounded-full opacity-[0.07] dark:opacity-[0.12]"
            style={{ background: '#3ddbd9', filter: 'blur(120px)', animation: 'float 20s ease-in-out infinite', animationDelay: '-7s' }} />
          <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full opacity-[0.07] dark:opacity-[0.12]"
            style={{ background: '#FFC166', filter: 'blur(120px)', animation: 'float 20s ease-in-out infinite', animationDelay: '-14s' }} />
        </div>

        {/* Hero section */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-6 md:px-12 lg:px-24 py-12">

          {/* Left — text content */}
          <div className="flex flex-col max-w-lg order-2 lg:order-1">
            <p className="carbon-label-01 uppercase tracking-widest text-[color:var(--text-tertiary)] mb-3">
              Multimodal Research Platform
            </p>
            <h1 className="carbon-heading-07 gradient-title mb-2">
              SMASH
            </h1>
            <p className="carbon-body-02 text-[color:var(--text-secondary)] mb-8 max-w-md">
              Synthesis and Multimodal Analytics System for Humanities.
              A three-module toolkit for audiovisual corpus exploration — from
              preview to cross-modal analysis.
            </p>

            {/* Module pills */}
            <div className="flex flex-wrap gap-3 mb-10">
              {Object.entries(MODULES).map(([key, mod]) => (
                <button
                  key={key}
                  onMouseEnter={() => setActive(key)}
                  onClick={() => setActive(key)}
                  className={`carbon-label-01 px-4 py-1.5 border transition-all duration-200 cursor-pointer
                    ${active === key
                      ? 'border-transparent -translate-y-px'
                      : 'text-[color:var(--text-secondary)] border-[color:var(--border-secondary)] hover:border-[color:var(--text-primary)] hover:-translate-y-px'
                    }`}
                  style={active === key ? { backgroundColor: mod.color, color: mod.textColor, borderColor: mod.color, boxShadow: 'var(--shadow-md)' } : {}}
                >
                  {mod.title}
                </button>
              ))}
            </div>

            {/* Active module info */}
            <div className="border-l-2 pl-6 transition-all duration-300" style={{ borderColor: info.color }}>
              <p className="carbon-label-01 text-[color:var(--text-tertiary)] mb-1">{info.step}</p>
              <h2 className="carbon-heading-03 text-[color:var(--text-primary)] mb-2">{info.title}</h2>
              <p className="carbon-body-01 text-[color:var(--text-secondary)] mb-4">{info.description}</p>
              <Link href={info.href}>
                <span
                  className="inline-flex items-center gap-2 carbon-body-01 font-medium px-5 py-2.5 cursor-pointer cta-hover"
                  style={{ backgroundColor: info.color, color: info.textColor }}
                >
                  Open {info.title} <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Right — 3D cube with glow */}
          <div className="w-[min(500px,80vw)] aspect-square order-1 lg:order-2 relative">
            {/* Ambient glow behind cube */}
            <div className="absolute inset-[15%] rounded-full -z-10 transition-all duration-500 pointer-events-none"
              style={{ boxShadow: info.glow }} aria-hidden="true" />
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 110" role="img" aria-label="Interactive cube showing three SMASH modules"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))', animation: 'breathe 6s ease-in-out infinite' }}>

              {/* Draw order: left face, right face, top face (top last = on top visually) */}

              {/* Face 1 — Preview (left) */}
              <Link href="/video_library">
                <path
                  className="cursor-pointer transition-all duration-300"
                  d="M50 20 L20 38 L20 72 L50 90 Z"
                  fill="#E05A7A"
                  opacity={active === 'preview' ? 1 : 0.6}
                  onMouseEnter={() => setActive('preview')}
                  aria-label="Preview module"
                  style={{ filter: active === 'preview' ? 'brightness(1.05) drop-shadow(0 4px 12px rgba(0,0,0,0.2))' : 'brightness(0.95)' }}
                />
                <text className="font-medium text-[4.5px] pointer-events-none select-none fill-[rgba(255,255,255,0.95)] tracking-wide"
                  x="33" y="56" textAnchor="middle" dominantBaseline="central">Preview</text>
                <g opacity="0.5" className="pointer-events-none">
                  <path d="M27 64 Q31 56, 35 64 Q39 72, 41 64" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </g>
              </Link>

              {/* Face 3 — Analytics (right) — drawn BEFORE top face */}
              <Link href="/analytics">
                <path
                  className="cursor-pointer transition-all duration-300"
                  d="M50 20 L80 38 L80 72 L50 90 Z"
                  fill="#FFC166"
                  opacity={active === 'analytics' ? 1 : 0.6}
                  onMouseEnter={() => setActive('analytics')}
                  aria-label="Analytics module"
                  style={{ filter: active === 'analytics' ? 'brightness(1.05) drop-shadow(0 4px 12px rgba(0,0,0,0.2))' : 'brightness(0.95)' }}
                />
                <text className="font-medium text-[4.5px] pointer-events-none select-none fill-[rgba(255,255,255,0.95)] tracking-wide"
                  x="67" y="56" textAnchor="middle" dominantBaseline="central">Analytics</text>
                <g opacity="0.5" className="pointer-events-none">
                  <circle cx="67" cy="64" r="5" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
                  <circle cx="67" cy="64" r="1.8" fill="rgba(255,255,255,0.5)"/>
                </g>
              </Link>

              {/* Face 2 — Analysis (top) — drawn LAST so it sits on top */}
              <Link href="/analysis">
                <path
                  className="cursor-pointer transition-all duration-300"
                  d="M50 20 L80 38 L50 55 L20 38 Z"
                  fill="#3ddbd9"
                  opacity={active === 'analysis' ? 1 : 0.6}
                  onMouseEnter={() => setActive('analysis')}
                  aria-label="Analysis module"
                  style={{ filter: active === 'analysis' ? 'brightness(1.05) drop-shadow(0 4px 12px rgba(0,0,0,0.2))' : 'brightness(0.95)' }}
                />
                <text className="font-medium text-[4.5px] pointer-events-none select-none fill-[rgba(255,255,255,0.95)] tracking-wide"
                  x="50" y="37" textAnchor="middle" dominantBaseline="central">Analysis</text>
                <g opacity="0.5" className="pointer-events-none">
                  <path d="M42 42 Q50 34, 58 42" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <circle cx="58" cy="42" r="1.5" fill="rgba(255,255,255,0.5)"/>
                </g>
              </Link>

              {/* Edge lines for 3D depth */}
              <g className="pointer-events-none" opacity="0.15">
                <line x1="50" y1="20" x2="50" y2="90" stroke="white" strokeWidth="0.5"/>
                <line x1="20" y1="38" x2="80" y2="38" stroke="white" strokeWidth="0.5"/>
                <line x1="50" y1="55" x2="50" y2="90" stroke="white" strokeWidth="0.3"/>
              </g>
            </svg>
          </div>
        </div>

        {/* Footer strip */}
        <footer className="border-t border-[color:var(--border-primary)] py-4 px-6 md:px-12 lg:px-24">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="carbon-label-01 text-[color:var(--text-tertiary)]">
              Radboud University · Donders Institute for Brain, Cognition and Behaviour
            </p>
            <p className="carbon-label-01 text-[color:var(--text-tertiary)]">
              &copy; {new Date().getFullYear()} SMASH
            </p>
          </div>
        </footer>
      </main>
    </>
  )
}

export default LandingPage
