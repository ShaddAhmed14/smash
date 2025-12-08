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
    <div className="flex flex-row gap-x-2 overflow-x-auto overflow-y-hidden w-full">
      {Object.entries(images).map(([modelName, imageUrl]) => (
        <div key={modelName} title={modelName} className="cursor-pointer hover:scale-105">
          <Image width={50} height={50} className="object-contain w-full h-full rounded-lg" onClick={() => setSelectedModel(modelName)} key={modelName} src={imageUrl} alt={`Thumbnail for ${modelName}`} loading="lazy" />
        </div>

      ))}
    </div>
  )
})

export default VideoThumbnail