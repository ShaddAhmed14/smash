'use client'

import { useState, useEffect } from "react"
import VideoAnalysis from "../components/VideoAnalysis"
import AudioAnalysis from "../components/AudioAnalysis"
import GestureAnalysis from "../components/GestureAnalysis"

const AnalysisPage = ({video_name}) => {
  const [progress, setProgress] = useState(0)
  const totalDuration = 5
  const [option, setOption] = useState("video")
  const tab_css = "border rounded border-white p-2 mb-3 hover:bg-gray-700"

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return prevProgress + (100 / totalDuration)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [totalDuration])

  return (
    <>
      {progress < 100 ? 
      <div className="flex flex-col justify-center align-center items-center h-screen">
        <div className="text-xl font-bold">{progress < 80 ? "Processing Video..." : "Loading Dashboard..."}</div>
        <div className="w-3/4 bg-gray-200 rounded-full h-4 m-4">
          <div className="bg-blue-500 h-4 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}/>
        </div>
      </div>
      : 
      <div className="flex flex-col">
          <div className="w-1/4 mx-auto my-5 border-b border-white  flex flex-row justify-between">
              <p onClick={() => setOption("video")} className={tab_css}>Video</p>
              <p onClick={() => setOption("audio")} className={tab_css}>Audio</p>
              <p onClick={() => setOption("gesture")} className={tab_css}>Gesture</p>
          </div>
          <div>
              {option == "video" && <VideoAnalysis video_name={video_name} />}
              {option == "audio" && <AudioAnalysis video_name={video_name} />}
              {option == "gesture" && <GestureAnalysis video_name={video_name} />}
          </div>
      </div>
        }
    </>

  )
}

export default AnalysisPage