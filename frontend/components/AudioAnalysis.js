'use client'

import { useRef } from "react"
import AudioWaveform from "./AudioWaveform"
import AudioTranscript from "./AudioTranscript"
import AudioFeatures from "./Audio/AudioFeatures"

const AudioAnalysis = ({video_name}) => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL + "/fetch_video" + "?video_name=" + video_name + "&model_name=original"
  const video_ref = useRef(null)
  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        <div className="w-1/3">
          <video src={url} ref={video_ref} controls></video>
        </div>
        <div className="w-1/3">
          <AudioWaveform video_name={video_name} video_ref={video_ref} />
        </div>
        <div className="w-1/3">
          <AudioTranscript video_name={video_name} video_ref={video_ref} />
        </div>
      </div>
      <div>
        <AudioFeatures video_name={video_name} />
      </div>
    </div>
  )
}

export default AudioAnalysis