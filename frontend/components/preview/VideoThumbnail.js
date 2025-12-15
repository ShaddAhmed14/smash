'use client'
import Image from "next/image"
import { useState, useEffect, memo } from "react"

const VideoThumbnail = memo(function VideoThumbnail({videoName, selectedModel, setSelectedModel}) {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_PREVIEW + "/fetch_thumbnails/?video_name=" + videoName + "&selectedModel=" + selectedModel
  const [images, setImages] = useState({})
  useEffect(() => {
    const fetchImages = async () => {
      const response = await fetch(url)
      const data = await response.json()
      setImages(data)
    }
    fetchImages()
  }, [url])

  return (
    <div className="flex flex-row overflow-x-auto overflow-y-hidden w-full p-2 justify-between">
      {Object.entries(images).map(([modelName, imageUrl]) => (
        <div key={modelName} title={modelName} className="cursor-pointer hover:scale-105 w-3/4">
          <div className="object-fill">
            <Image width={200} height={150}  onClick={() => setSelectedModel(modelName)} key={modelName} src={imageUrl} alt={`Thumbnail for ${modelName}`} loading="lazy" />
           </div> 
          <p className="text-center text-sm break-all p-2 bg-primary ">{modelName}</p>
        </div>

      ))}
    </div>
  )
})

export default VideoThumbnail