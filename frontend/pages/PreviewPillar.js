'use client'
import {useRef, memo } from "react"

import MetadataGraph from "../components/preview/MetadataGraph"
import dynamic from "next/dynamic"

const VideoPlayer = dynamic(() => import("../components/preview/VideoPlayer"), { ssr: false, 
  loading: () => <p>Loading Video Player...</p>
 })

const AudioWaveform = dynamic(() => import("../components/preview/AudioWaveform"), { ssr: false,
  loading: () => <p>Loading Audio Waveform...</p>
})
const Waveform = dynamic(() => import("../components/preview/Waveform"), { ssr: false,
  loading: () => <p>Loading Waveform...</p>
})

const Transcript = dynamic(() => import("../components/preview/Transcript"), { ssr: false,
  loading: () => <p>Loading Transcript...</p>
})

const PreviewPillar = memo(function PreviewPillar({video_name}) {
  const videoRef = useRef(null)
  const border_css = "border-4 border-red-700 rounded-lg p-2"
  return (
    <div className="flex flex-col m-4">
      <div className=" max-h-[90vh] flex flex-row justify-evenly gap-x-2 overflow-y-auto">
        <div className={`w-6/10 max-h-full ${border_css}`}>
          <VideoPlayer videoName={video_name} videoRef={videoRef} />
        </div>
        <div className={`grid grid-rows-2 gap-4 w-4/10 ${border_css}`}>
          <Waveform videoName={video_name} videoRef={videoRef} />
          {/* <AudioWaveform videoName={video_name} videoRef={videoRef} /> */}
          <Transcript videoName={video_name} videoRef={videoRef} />
        </div>
      </div>
      <div className={`${border_css} my-4 max-h-[40%]`}>
        <MetadataGraph />
      </div>
    </div>
  )
})

export default PreviewPillar