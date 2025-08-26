'use client'

import { useState, useEffect } from "react"
import VideoCard from "./VideoCard"

const VideoLibrary = () => {
  const [videoMetadata, setVideoMetadata] = useState(null)
  useEffect(() => {
    let url = process.env.NEXT_PUBLIC_BACKEND_URL + "/get_metadata"
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
    <div>
      <div>
        <h1>Video Library</h1>
      </div>
      <div>
        <p>filter</p>
        <p>search bar</p>
      </div>
      <div>
        {
          videoMetadata.map((video_info, idx) => (
            <VideoCard key={idx} video_info={video_info} />
          ))
        }
      </div>
    </div>
  )
}

export default VideoLibrary;

// load metadata and make list of videos
// they can click video to watch it/ or a clip of it
// click process button to go next page
// add filters and search button