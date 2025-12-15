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
    <div className='flex flex-col justify-between gap-y-2 max-h-full mx-2'>
      {/* Video Title */}
      <div className="flex-[1] flex flex-row justify-between items-center">
        <p className="text-l break-all text-primary">Video ID:{videoName}</p>
        <p>Selected Variant: {selectedModel}</p>
      </div>
      {/* Video and Gallery Button */}
      <div className="flex-[1] relative">
        <video onTimeUpdate={handleTimeUpdate}
         preload="metadata" src={url} onError={(e) => console.error('Video element error:', e)} ref={videoRef} 
         className="object-contain rounded-lg mx-auto w-auto h-auto" controls/>
        <Link href={'/video_library'} className="absolute top-0 p-2 z-50 text-white cursor-pointer">
          <GrGallery />
        </Link>
      </div>
      {/* Video Thumbnails for Models */}
      <div className="flex-[1] w-[90%] mx-auto">
        <VideoThumbnail videoName={videoName} selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
      </div>
    </div>
  )
})

export default VideoPlayer
// keep a list of models
// selected video shows model name/ org and send the rest to thumbnail component
// u could get models from backend too. 