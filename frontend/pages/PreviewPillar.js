'use client'
import { useState, useRef } from "react"
import AudioWaveform from "../components/AudioWaveform"
import VideoPlayer from "../components/VideoPlayer"
import Transcript from "../components/Transcript"
import MetadataGraph from "../components/MetadataGraph"
import VideoLibraryPage from "./VideoLibraryPage"
import { VideoContext } from "@/app/page"

const PreviewPillar = () => {
  const [videoName, setVideoName] = useState("")
  const [changeVideo, setChangeVideo] = useState(false)
  const videoRef = useRef(null)
  const border_css = "border-4 border-blue-400 rounded-lg p-2"
  return (
    changeVideo ?
    <VideoContext.Provider value={{setChangeVideo, setVideoName}}>
      <VideoLibraryPage /> 
    </VideoContext.Provider>
    :
    <div className="flex flex-col m-4">
      <div className=" max-h-[90vh] flex flex-row justify-evenly gap-x-2 overflow-y-auto">
        <div className={`w-6/10 max-h-full ${border_css}`}>
          <VideoPlayer videoName={videoName} setChangeVideo={setChangeVideo} videoRef={videoRef} />
        </div>
        <div className={`flex flex-col w-4/10 justify-start ${border_css}`}>
          <AudioWaveform videoName={videoName} videoRef={videoRef} />
          <Transcript videoName={videoName} videoRef={videoRef} />
        </div>
      </div>
      <div className={`${border_css} my-4 max-h-[40%]`}>
        <MetadataGraph />
      </div>
    </div>
  )
}

export default PreviewPillar