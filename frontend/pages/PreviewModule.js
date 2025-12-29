'use client'
import {useRef, memo, useState, useEffect } from "react"

import dynamic from "next/dynamic"
import NavBar from "../components/NavBar"
import Footer from "@/components/Footer"

const VideoPlayer = dynamic(() => import("../components/preview/VideoPlayer"), { ssr: false,
  loading: () => <p>Loading Video Player...</p>
 })

const Waveform = dynamic(() => import("../components/preview/Waveform"), { ssr: false,
  loading: () => <p>Loading Waveform...</p>
})

const Transcript = dynamic(() => import("../components/preview/Transcript"), { ssr: false,
  loading: () => <p>Loading Transcript...</p>
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
    // Simulate progress update
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
    <div className="flex flex-col mt-12 m-0">
      <div className=" max-h-[85vh] flex flex-row justify-evenly gap-0 overflow-y-auto">
        <div className="w-5/10 max-h-full border border-primary">
          <VideoPlayer videoName={video_name} videoRef={videoRef} updateTime={setCurrentTime} />
        </div>
        <div className="grid grid-rows-2 w-5/10 border border-primary">
          <Waveform videoName={video_name} currentTime={currentTime} />
          <Transcript videoName={video_name} currentTime={currentTime} />
        </div>
      </div>
    </div>
    {/* Processing Bar */}
    <div className="fixed bottom-0 left-0 bg-secondary h-[72px] border-t-2 border-(--custom-preview-dark) w-full px-6 flex flex-row items-center justify-between z-50">
      <div className="flex flex-row  items-center gap-4">
        <div className={`w-5 h-5 border-t-2 border-(--custom-preview-dark) rounded-[50%] animate-spin ${progress < 100 ? 'block' : 'hidden'}`}></div>
        <div className="flex flex-col gap-0.5">
          <p className="text-[0.875rem] font-semibold">Processing in Background</p>
          <p className="text-[0.75rem] text-secondary">{progressSteps(progress)}</p>
        </div>
      </div>
      <div className="flex-1 max-w-[400px] mx-8">
        <div className="h-1.5 bg-(--border-primary) rounded overflow-hidden mb-1">
            <div className="h-full bg-linear-to-r from-(--custom-preview-dark) to-[#c44d6a] w-0 transition-[width] duration-300" style={{width: `${progress}%`}}></div>
        </div>
        <div className="text-xs text-secondary text-right" style={{width: `${progress}%`}}>{progress}% complete</div>
      </div>
      <div className="flex gap-3">
            <button className="h-9 px-4 border border-primary bg-transparent text-primary font-[inherit] text-[0.8125rem] cursor-pointer hover:bg-primary">View Details</button>
            <a href="/analysis"><button className={`h-9 px-4 border border-(--button-primary) bg-(--button-primary) text-white font-[inherit] text-[0.8125rem] cursor-pointer hover:bg-primary ${progress == 100 ? 'block' : 'hidden'}`}>Continue to Analysis →</button></a>
      </div>
    </div>
  </>
  )
})

export default PreviewModule
