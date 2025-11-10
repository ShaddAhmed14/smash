'use client'
import VideoThumbnail from "./VideoThumbnail"
import { useState, memo, useMemo} from "react"
import { GrGallery } from "react-icons/gr"
import Link from "next/link"

const VideoPlayer = memo(function VideoPlayer({videoName, videoRef}) {
  const [selectedModel, setSelectedModel] = useState("Original");
  const url = useMemo(() => process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_PREVIEW + "/fetch_video/" + "?video_name=" + videoName + "&model_name=" + selectedModel, [videoName, selectedModel]) 
  
  return (
    <div className='flex flex-col overflow-hidden justify-between gap-y-2'>
      <div className="align-middle m-auto p-0 max-h-[10%]">
        <p className="text-l break-all font-bold text-black">{videoName}_{selectedModel}</p>
      </div>
      <div className="relative inline-block w-full min-h-0 max-h-[50%]">
        <video preload="metadata" src={url} onError={(e) => console.error('Video element error:', e)} ref={videoRef} className="max-w-full max-h-full object-contain rounded-lg" controls/>
          <div title="Change Video">
            <Link href={'/video_library'} className="absolute top-4 left-4 text-white cursor-pointer">
              <GrGallery />
            </Link>
          </div>
      </div>
      <div className="max-h-[30%]">
        <VideoThumbnail videoName={videoName} selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
      </div>
    </div>
  )
})

export default VideoPlayer
// keep a list of models
// selected video shows model name/ org and send the rest to thumbnail component
// u could get models from backend too. 