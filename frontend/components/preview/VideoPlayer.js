'use client'
import VideoThumbnail from "./VideoThumbnail"
import { useState, memo, useMemo} from "react"
import { GrGallery } from "react-icons/gr"
import Link from "next/link"

const VideoPlayer = memo(function VideoPlayer({videoName, videoRef, updateTime}) {
  console.log("VideoPlayer render:", videoName)
  const [selectedModel, setSelectedModel] = useState("Original");
  const url = useMemo(() => process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_PREVIEW + "/fetch_video/" + "?video_name=" + videoName + "&model_name=" + selectedModel, [videoName, selectedModel]) 
  const handleTimeUpdate = ((e) => {
    if (videoRef && videoRef.current) {
      updateTime(e.target.currentTime);
    }
  })  
  return (
    <div className='flex flex-col justify-betwee'>
      {/* Video Title */}
      <div className="bg-secondary border border-primary flex flex-row items-center justify-between px-4 py-3">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.02em] text-secondary">Video Preview</p>
        <div className="flex flex-row gap-2.5 items-center">
          <Link href={'/video_library'} className="text-[0.875rem] cursor-pointer"><GrGallery /></Link>
          <p className="text-[0.75rem] text-tertiary">Video ID: {videoName}</p>
        </div>
      </div>
      {/* Video and Gallery Button */}
      <div className="flex-1 p-2">
        <video onTimeUpdate={handleTimeUpdate}
         preload="metadata" src={url} onError={(e) => console.error('Video element error:', e)} ref={videoRef} 
         className="object-contain mx-auto w-[90%] h-auto" controls/>
      </div>
      {/* Video Thumbnails for Models */}
      <div className="flex-1 bg-secondary">
        <VideoThumbnail videoName={videoName} selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
      </div>
    </div>
  )
})

export default VideoPlayer
// keep a list of models
// selected video shows model name/ org and send the rest to thumbnail component
// u could get models from backend too. 