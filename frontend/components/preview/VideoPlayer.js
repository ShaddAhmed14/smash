'use client'
import VideoThumbnail from "./VideoThumbnail"
import { useState, memo, useMemo} from "react"
import { GrGallery } from "react-icons/gr"
import Link from "next/link"
import { API_ROUTES } from '../../lib/api'

const VideoPlayer = memo(function VideoPlayer({videoName, videoRef, updateTime}) {
  const [selectedModel, setSelectedModel] = useState("Original");
  const url = useMemo(() => API_ROUTES.PREVIEW + "/fetch_video/" + "?video_name=" + videoName + "&model_name=" + selectedModel, [videoName, selectedModel]) 
  const handleTimeUpdate = ((e) => {
    if (videoRef && videoRef.current) {
      updateTime(e.target.currentTime);
    }
  })  
  return (
    <div className='flex flex-col'>
      {/* Video Title */}
      <div className="bg-[color:var(--bg-secondary)] border border-[color:var(--border-primary)] flex flex-row items-center justify-between px-4 py-3">
        <p className="carbon-label-01 font-semibold uppercase tracking-[0.02em] text-[color:var(--text-secondary)]">Video Preview</p>
        <div className="flex flex-row gap-2 items-center">
          <Link href={'/video_library'} className="carbon-body-01 cursor-pointer text-[color:var(--text-secondary)]"><GrGallery /></Link>
          <p className="carbon-label-01 text-[color:var(--text-tertiary)]">Video ID: {videoName}</p>
        </div>
      </div>
      {/* Video */}
      <div className="flex-1">
        <video onTimeUpdate={handleTimeUpdate}
         preload="metadata" src={url} onError={(e) => console.error('Video element error:', e)} ref={videoRef} 
         className="object-contain mx-auto h-auto" controls/>
      </div>
      {/* Video Thumbnails for Models */}
      <div className="flex-1 bg-[color:var(--bg-secondary)]">
        <VideoThumbnail videoName={videoName} selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
      </div>
    </div>
  )
})

export default VideoPlayer
// keep a list of models
// selected video shows model name/ org and send the rest to thumbnail component
// u could get models from backend too. 