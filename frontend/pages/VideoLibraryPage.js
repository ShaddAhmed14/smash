'use client'
import { useState, useEffect, memo } from "react"
import VideoCard from "../components/VideoCard"

const VideoLibrary = memo(function VideoLibrary() {
  const [videoMetadata, setVideoMetadata] = useState(null)
  useEffect(() => {
    let url = process.env.NEXT_PUBLIC_BACKEND_URL + "/fetch_metadata"
    console.log("url", url)
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok", response);
        }
        console.log("setting data")
        return response.json();
      })
      .then(data => {
        console.log("data:", data)
        setVideoMetadata(data)})
      .catch(error => {
        console.error("Error fetching metadata:", error);
      });
  }, [])

  if(videoMetadata == null){
    return <div>Loading...</div>
  } //

  return (
    <div className="m-3">
      <div>
        <h1 className="text-3xl">Video Library</h1>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {
          videoMetadata.map((video_info, idx) => (
            <VideoCard key={idx} video_info={video_info} />
          ))
        }
      </div>
    </div>
  )
})

export default VideoLibrary