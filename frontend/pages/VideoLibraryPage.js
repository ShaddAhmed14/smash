'use client'
import { useState, useEffect, memo } from "react"
import VideoCard from "../components/preview/VideoCard"
import NavBar from "../components/NavBar"
import Loader from "@/components/Loader"

const VideoLibrary = memo(function VideoLibrary() {
  const [videoMetadata, setVideoMetadata] = useState(null)
  
  useEffect(() => {
    let url = process.env.NEXT_PUBLIC_BACKEND_URL + process.env.NEXT_PUBLIC_PREVIEW + "/fetch_metadata"
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok", response);
        }
        return response.json();
      })
      .then(data => {
        setVideoMetadata(data)
      })
      .catch(error => {
        console.error("Error fetching metadata:", error);
      });
  }, [])

  if(videoMetadata == null){
    return  <Loader name={"Video Library"} />
  }

  return (
    <>
      <NavBar currentPage={"Video Library"} textColor={"--custom-preview"}/>
      <div className="mt-20 m-3">
        <div className="grid grid-cols-3 gap-4 m-2">
          {
            videoMetadata.map((video_info, idx) => (
              <VideoCard key={idx} video_info={video_info} />
            ))
          }
        </div>
      </div>
    </>
  )
})

export default VideoLibrary