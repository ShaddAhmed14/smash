'use client'
import VideoThumbnail from "./VideoThumbnail"
import { useState, memo, useMemo} from "react"
import { GrGallery } from "react-icons/gr"
import Link from "next/link"

const VideoPlayer = memo(function VideoPlayer({videoName, videoRef, setChangeVideo}) {
  const [selectedModel, setSelectedModel] = useState("Original");
  const url = useMemo(() => process.env.NEXT_PUBLIC_BACKEND_URL + "/fetch_video/" + "?video_name=" + videoName + "&model_name=" + selectedModel, [videoName, selectedModel]) 
  
  return (
    <div className='flex flex-col justify-start'>
      <div className="align-middle m-auto">
        <p className="text-l font-bold text-black">{videoName}_{selectedModel}</p>
      </div>
      {/* preload="none"  volume={0.0} */}
      <div className="relative inline-block">
        <video preload="none" src={url} onError={(e) => console.error('Video element error:', e)} ref={videoRef} className="w-auto w-full h-auto rounded-lg" controls/>
          <div title="Change Video">
            {/* <GrGallery className="absolute top-4 left-4 text-white cursor-pointer" onClick={() => setChangeVideo(true)} /> */}
            <Link href={'/video_library'} className="absolute top-4 left-4 text-white cursor-pointer">
              <GrGallery />
            </Link>
          </div>
      

      </div>
      <div className="my-4">
        <VideoThumbnail videoName={videoName} selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
      </div>
    </div>
  )
})

export default VideoPlayer
// keep a list of models
// selected video shows model name/ org and send the rest to thumbnail component
// u could get models from backend too. 