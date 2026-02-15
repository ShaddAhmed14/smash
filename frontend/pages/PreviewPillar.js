'use client'
import {useRef, memo, useState, useEffect } from "react"


import MetadataGraph from "../components/preview/MetadataGraph"
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
// added this to comply with typescript rules [page.tsx]
/**
 * @param {{ video_name: string }} props
 */
const PreviewPillar = memo(function PreviewPillar({video_name}) {
  console.log("PreviewPillar render:", video_name)
  const videoRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)
  const border_css = "border-2 border-primary"

  return (
  <>
    <NavBar currentPage="Preview" textColor={"--custom-preview"} />
    <div className="flex flex-col mt-18 m-0">
      <div className=" max-h-[85vh] flex flex-row justify-evenly gap-0 overflow-y-auto">
        <div className={`w-6/10 max-h-full ${border_css}`}>
          <VideoPlayer videoName={video_name} videoRef={videoRef} updateTime={setCurrentTime} />
        </div>
        <div className={`grid grid-rows-2 w-4/10 ${border_css}`}>
          <Waveform videoName={video_name} currentTime={currentTime} />
          <Transcript videoName={video_name} currentTime={currentTime} />
        </div>
      </div>
      {/* <div className={`${border_css} my-4`}>
        <MetadataGraph />
      </div> */}
    </div>
    <Footer />  
  </>
  )
})

export default PreviewPillar
