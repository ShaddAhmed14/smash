'use client'
import {useRef, memo, useState, useEffect } from "react"

import dynamic from "next/dynamic"
import NavBar from "../components/NavBar"

const VideoPlayer = dynamic(() => import("../components/preview/VideoPlayer"), { ssr: false,
  loading: () => <p className="carbon-body-01 text-[color:var(--text-tertiary)] p-4">Loading Video Player...</p>
})

const Waveform = dynamic(() => import("../components/preview/Waveform"), { ssr: false,
  loading: () => <p className="carbon-body-01 text-[color:var(--text-tertiary)] p-4">Loading Waveform...</p>
})

const Transcript = dynamic(() => import("../components/preview/Transcript"), { ssr: false,
  loading: () => <p className="carbon-body-01 text-[color:var(--text-tertiary)] p-4">Loading Transcript...</p>
})

const PreviewModule = memo(function PreviewModule({video_name}) {
  const videoRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [progress, setProgress] = useState(0)
  const progressSteps = (progress) => {
    const steps = {
      0: 'Starting processing',
      15: 'Extracting audio and video streams',
      30: 'Detecting gestures and body movement',
      50: 'Analyzing facial expressions',
      70: 'Processing speech prosody',
      85: 'Computing temporal alignments',
      95: 'Finalizing analysis',
      100: 'Processing complete'
    }
    const key = Object.keys(steps).find(k => progress <= k)
    return steps[key]
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + 5
        if (nextProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return nextProgress
      })
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
  <>
    <NavBar currentPage="Preview" textColor={"--custom-preview-dark"} />
    {/* Content area: full viewport minus nav (48px) and processing bar (64px) */}
    <div className="flex flex-col pt-12">
      <div className="h-[calc(100vh-7rem)] flex flex-row overflow-y-auto">
        {/* Left: Video player — 50% */}
        <div className="w-1/2 border-r border-[color:var(--border-primary)]">
          <VideoPlayer videoName={video_name} videoRef={videoRef} updateTime={setCurrentTime} />
        </div>
        {/* Right: Waveform + Transcript — 50%, split equally */}
        <div className="grid grid-rows-2 w-1/2">
          <div className="border-b border-[color:var(--border-primary)]">
            <Waveform videoName={video_name} currentTime={currentTime} />
          </div>
          <Transcript videoName={video_name} currentTime={currentTime} />
        </div>
      </div>
    </div>

    {/* Processing Bar — 64px, consistent with action bar on VideoLibrary */}
    <div className="fixed bottom-0 left-0 bg-[color:var(--bg-secondary)] h-16 border-t-2 border-[color:var(--custom-preview-dark)] w-full px-6 flex flex-row items-center justify-between z-50 processing-glow">
      <div className="flex flex-row items-center gap-4">
        <div className={`w-5 h-5 border-t-2 border-[color:var(--custom-preview-dark)] rounded-full animate-spin ${progress < 100 ? 'block' : 'hidden'}`}></div>
        <div className="flex flex-col gap-0.5">
          <p className="carbon-body-01 font-semibold">Processing in Background</p>
          <p className="carbon-label-01 text-[color:var(--text-secondary)]">{progressSteps(progress)}</p>
        </div>
      </div>
      <div className="flex-1 max-w-[400px] mx-8">
        <div className="h-1.5 bg-[color:var(--border-primary)] rounded-sm overflow-hidden mb-1">
          <div className="h-full progress-gradient w-0 rounded-sm transition-[width] duration-300" style={{width: `${progress}%`}}></div>
        </div>
        <p className="carbon-label-01 text-[color:var(--text-secondary)] text-right">{progress}% complete</p>
      </div>
      <div className="flex gap-3">
        <button className="h-10 px-4 border border-[color:var(--border-primary)] bg-transparent carbon-body-01 cursor-pointer text-[color:var(--text-primary)] hover:bg-[color:var(--bg-tertiary)] cta-hover">View Details</button>
        <a href="/analysis">
          <button className={`h-10 px-4 border border-[color:var(--button-primary)] bg-[color:var(--button-primary)] carbon-body-01 text-white cursor-pointer cta-hover ${progress === 100 ? 'block' : 'hidden'}`}>Continue to Analysis →</button>
        </a>
      </div>
    </div>
  </>
  )
})

export default PreviewModule
