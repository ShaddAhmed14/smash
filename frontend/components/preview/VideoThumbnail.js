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
    <div className="flex flex-row gap-x-2 overflow-x-auto w-full">
      {Object.entries(images).map(([modelName, imageUrl]) => (
        <div key={modelName} title={modelName} className="">
          <Image width={100} height={50} className="w-auto h-auto rounded-lg" onClick={() => setSelectedModel(modelName)} key={modelName} src={imageUrl} alt={`Thumbnail for ${modelName}`} loading="lazy" />
          {/* <img className="min-w-[150px] w-auto h-auto rounded-lg" onClick={() => setSelectedModel(modelName)} key={modelName} src={imageUrl} alt={`Thumbnail for ${modelName}`} /> */}
        </div>

      ))}
    </div>
  )
})

export default VideoThumbnail