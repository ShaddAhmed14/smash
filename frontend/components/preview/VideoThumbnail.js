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
    <div className="flex flex-row overflow-x-auto overflow-y-hidden w-full p-3 justify-between gap-2">
      {Object.entries(images).map(([modelName, imageUrl]) => (
        <div key={modelName} title={modelName} className="h-24 w-36 bg-primary items-center justify-center flex flex-col cursor-pointer hover:scale-105 transition-transform">
          <Image width={150} height={150}  onClick={() => setSelectedModel(modelName)} key={modelName} src={imageUrl} alt={`Thumbnail for ${modelName}`} loading="lazy" />
          <p className="text-[0.625rem] py-1 px-2 text-secondary  break-all">{modelName}</p>
        </div>

      ))}
    </div>
  )
})

export default VideoThumbnail