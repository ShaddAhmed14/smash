'use client'
import {memo, forwardRef} from "react"

const VideoPlayer = memo(forwardRef(
  function VideoPlayer({video_name, model_name, handlePlay=null, handlePause=null, handleSeek=null}, ref) {
  
  let original_video = model_name === "Original"
  let url = process.env.NEXT_PUBLIC_BACKEND_URL + "/fetch_video" + "?video_name=" + video_name + "&model_name=" + model_name
  return (
    <div className="flex flex-col">
      <p>{model_name}</p>
      {original_video ? 
      <video src={url} ref={ref} onPlay={handlePlay} onPause={handlePause} onSeeked={handleSeek} controls></video> 
      : <video src={url} ref={ref} ></video>}
    </div>
  )}))

export default VideoPlayer